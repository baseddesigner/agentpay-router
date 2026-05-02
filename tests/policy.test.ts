import { describe, expect, it } from 'vitest';
import { evaluatePolicy } from '../src/policy.js';
import type { QuoteResponse } from '../src/quote.js';

const quote: QuoteResponse = {
  id: 'quote_test',
  chainId: 8453,
  sell: 'USDC',
  buy: 'WETH',
  amount: '1',
  quote: { estimatedOut: '0.0003', executionPrice: '0.0003 WETH / USDC', source: 'test' },
  route: [{ dex: 'test', pair: '0xpair' }],
  timestamp: new Date().toISOString(),
};

describe('evaluatePolicy', () => {
  it('approves safe Base USDC/WETH handoffs', () => {
    const result = evaluatePolicy(quote, { maxUsd: 10, maxSlippageBps: 100 });
    expect(result.decision).toBe('approved');
    expect(result.checks.every((c) => c.status === 'pass')).toBe(true);
  });

  it('blocks notional above policy max', () => {
    const result = evaluatePolicy(quote, { maxUsd: 0.5, maxSlippageBps: 100 });
    expect(result.decision).toBe('blocked');
    expect(result.checks.find((c) => c.name === 'max_usd')?.status).toBe('fail');
  });
});
