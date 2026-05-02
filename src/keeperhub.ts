import { z } from 'zod';
import { getLiveQuote, tokenAddress, type QuoteResponse } from './quote.js';
import { evaluatePolicy } from './policy.js';

export const prepareExecutionSchema = z.object({
  wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/).default('0x0000000000000000000000000000000000000000'),
  quote: z.any().optional(),
  quoteRequest: z
    .object({ sell: z.string().default('USDC'), buy: z.string().default('WETH'), amount: z.coerce.number().positive().default(1), chainId: z.coerce.number().default(8453) })
    .optional(),
  policy: z.any().optional(),
});

export async function prepareKeeperHubExecution(input: unknown) {
  const parsed = prepareExecutionSchema.parse(input ?? {});
  const quote = (parsed.quote as QuoteResponse | undefined) ?? (await getLiveQuote(parsed.quoteRequest ?? {}));
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
    note: 'Execution-ready handoff. Live KeeperHub submission is intentionally gated behind KH_API_KEY and --execute.',
  };

  return {
    status: policyResult.decision === 'approved' ? 'ready_for_keeperhub' : 'blocked_by_policy',
    quote,
    policyChecks: policyResult.checks,
    keeperhub: {
      mode: process.env.KH_API_KEY ? 'workflow_or_direct_execution_available' : 'handoff_only_no_api_key',
      endpoint: process.env.KH_WORKFLOW_ID
        ? `https://app.keeperhub.com/api/workflows/${process.env.KH_WORKFLOW_ID}/webhook`
        : 'https://app.keeperhub.com/api/execute/contract-call',
      payloadPreview,
    },
  };
}
