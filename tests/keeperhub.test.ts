import { describe, expect, it } from 'vitest';
import { prepareKeeperHubExecution } from '../src/keeperhub.js';

const paidCbbtcQuote = {
  payment: { status: 'settled', mode: 'demo', amountUsd: 0.001 },
  id: 'quote_test_cbbtc',
  chainId: 8453,
  sell: 'USDC',
  buy: 'CBBTC',
  amount: '100',
  quote: {
    estimatedOut: '0.0012',
    executionPrice: '0.00001200 CBBTC / USDC',
    source: 'DexScreener live Base CBBTC/USDC market data',
    pairAddress: '0x1234567890abcdef1234567890abcdef12345678',
    liquidityUsd: 1000000,
  },
  route: [{ dex: 'aerodrome', pair: '0x1234567890abcdef1234567890abcdef12345678' }],
  timestamp: '2026-05-02T18:00:00.000Z',
};

describe('prepareKeeperHubExecution', () => {
  it('rejects raw quote requests so handoff cannot bypass the paid quote endpoint', async () => {
    await expect(
      prepareKeeperHubExecution({
        wallet: '0x0000000000000000000000000000000000000000',
        quoteRequest: { sell: 'USDC', buy: 'CBBTC', amount: 100 },
        policy: { maxUsd: 5000, maxSlippageBps: 100 },
      }),
    ).rejects.toThrow(/paid quote/i);
  });

  it('rejects forged or incomplete quotes', async () => {
    await expect(
      prepareKeeperHubExecution({
        wallet: '0x0000000000000000000000000000000000000000',
        quote: { id: 'quote_forged', sell: 'USDC', buy: 'CBBTC', amount: '100' },
        policy: { maxUsd: 5000, maxSlippageBps: 100 },
      }),
    ).rejects.toThrow();
  });

  it('accepts a paid cbBTC quote and returns a handoff preview', async () => {
    const handoff = await prepareKeeperHubExecution({
      wallet: '0x0000000000000000000000000000000000000000',
      quote: paidCbbtcQuote,
      policy: { maxUsd: 5000, maxSlippageBps: 100 },
    });

    expect(handoff.status).toBe('ready_for_keeperhub');
    expect(handoff.handoffHash).toMatch(/^0x[a-f0-9]{64}$/);
    expect(handoff.handoffReceipt).toMatchObject({
      kind: 'handoff_receipt',
      hash: handoff.handoffHash,
    });
    expect(handoff.handoffReceipt.note).toContain('not an onchain transaction hash');
    expect(handoff.keeperhub.payloadPreview.buyToken).toMatchObject({ symbol: 'CBBTC' });
    expect(handoff.keeperhub.payloadPreview.note).toContain('handoff preview');
  });

  it('returns the same handoffHash for the same paid quote, policy, and payload', async () => {
    const input = {
      wallet: '0x0000000000000000000000000000000000000000',
      quote: paidCbbtcQuote,
      policy: { maxUsd: 5000, maxSlippageBps: 100 },
    };

    const first = await prepareKeeperHubExecution(input);
    const second = await prepareKeeperHubExecution(input);

    expect(second.handoffHash).toBe(first.handoffHash);
  });
});
