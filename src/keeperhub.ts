import { createHash } from 'node:crypto';
import { z } from 'zod';
import { paidQuoteResponseSchema, tokenAddress, type QuoteResponse } from './quote.js';
import { evaluatePolicy } from './policy.js';

export const prepareExecutionSchema = z
  .object({
    wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/).default('0x0000000000000000000000000000000000000000'),
    quote: paidQuoteResponseSchema,
    quoteRequest: z.never({ error: 'Handoff requires the paid quote returned by /quote; quoteRequest would bypass payment.' }).optional(),
    policy: z.any().optional(),
  })
  .strict();

function stable(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, val]) => [key, stable(val)]),
    );
  }
  return value;
}

function handoffHashFor(input: unknown) {
  return `0x${createHash('sha256').update(JSON.stringify(stable(input))).digest('hex')}`;
}

export async function prepareKeeperHubExecution(input: unknown) {
  const parsed = prepareExecutionSchema.parse(input ?? {});
  const quote = parsed.quote as QuoteResponse;
  const policyResult = evaluatePolicy(quote, parsed.policy ?? {});
  const slippageBps = policyResult.policy.maxSlippageBps;

  const payloadPreview = {
    network: 'base',
    owner: parsed.wallet,
    sellToken: { symbol: quote.sell, address: tokenAddress(quote.sell) },
    buyToken: { symbol: quote.buy, address: tokenAddress(quote.buy) },
    amountIn: quote.amount,
    estimatedAmountOut: quote.quote.estimatedOut,
    maxSlippageBps: slippageBps,
    route: quote.route,
    note: 'KeeperHub handoff preview only. Live submission/signing stays gated behind explicit KeeperHub credentials and execution configuration.',
  };

  const status = policyResult.decision === 'approved' ? 'ready_for_keeperhub' : 'blocked_by_policy';
  const keeperhub = {
    mode: process.env.KH_API_KEY ? 'handoff_preview_credentials_available' : 'handoff_preview_no_api_key',
    endpoint: process.env.KH_WORKFLOW_ID
      ? `https://app.keeperhub.com/api/workflows/${process.env.KH_WORKFLOW_ID}/webhook`
      : 'https://app.keeperhub.com/api/execute/contract-call',
    payloadPreview,
  };
  const handoffHash = handoffHashFor({
    version: 'agentpay-router-handoff-v1',
    status,
    quote,
    policyChecks: policyResult.checks,
    keeperhub,
  });

  return {
    status,
    handoffHash,
    handoffReceipt: {
      kind: 'handoff_receipt',
      hash: handoffHash,
      note: 'This is not an onchain transaction hash. It is a deterministic receipt for the paid quote, policy checks, and KeeperHub payload preview.',
    },
    quote,
    policyChecks: policyResult.checks,
    keeperhub,
  };
}
