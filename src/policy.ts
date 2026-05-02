import { z } from 'zod';
import type { QuoteResponse } from './quote.js';

export const policySchema = z.object({
  maxUsd: z.number().positive().default(10),
  maxSlippageBps: z.number().int().min(1).max(2_000).default(100),
  allowedChains: z.array(z.number()).default([8453]),
  allowedTokens: z.array(z.string()).default(['USDC', 'WETH']),
});

export type Policy = z.infer<typeof policySchema>;
export type PolicyCheck = { name: string; status: 'pass' | 'fail'; detail: string };

export function evaluatePolicy(quote: QuoteResponse, policyInput: unknown): { decision: 'approved' | 'blocked'; checks: PolicyCheck[]; policy: Policy } {
  const policy = policySchema.parse(policyInput ?? {});
  const amountUsd = quote.sell === 'USDC' ? Number(quote.amount) : Number(quote.quote.estimatedOut);
  const checks: PolicyCheck[] = [
    {
      name: 'chain',
      status: policy.allowedChains.includes(quote.chainId) ? 'pass' : 'fail',
      detail: `chainId=${quote.chainId}`,
    },
    {
      name: 'token_allowlist',
      status: policy.allowedTokens.includes(quote.sell) && policy.allowedTokens.includes(quote.buy) ? 'pass' : 'fail',
      detail: `${quote.sell}->${quote.buy}`,
    },
    {
      name: 'max_usd',
      status: amountUsd <= policy.maxUsd ? 'pass' : 'fail',
      detail: `estimated notional $${amountUsd.toFixed(4)} <= $${policy.maxUsd}`,
    },
    {
      name: 'slippage',
      status: policy.maxSlippageBps <= 500 ? 'pass' : 'fail',
      detail: `maxSlippageBps=${policy.maxSlippageBps}`,
    },
  ];
  return {
    decision: checks.every((c) => c.status === 'pass') ? 'approved' : 'blocked',
    checks,
    policy,
  };
}
