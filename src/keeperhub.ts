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

  return {
    status: policyResult.decision === 'approved' ? 'ready_for_keeperhub' : 'blocked_by_policy',
    quote,
    policyChecks: policyResult.checks,
    keeperhub: {
      mode: process.env.KH_API_KEY ? 'handoff_preview_credentials_available' : 'handoff_preview_no_api_key',
      endpoint: process.env.KH_WORKFLOW_ID
        ? `https://app.keeperhub.com/api/workflows/${process.env.KH_WORKFLOW_ID}/webhook`
        : 'https://app.keeperhub.com/api/execute/contract-call',
      payloadPreview,
    },
  };
}
