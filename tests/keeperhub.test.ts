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
    expect(handoff.wallet).toMatchObject({
      input: '0x0000000000000000000000000000000000000000',
      address: '0x0000000000000000000000000000000000000000',
    });
    expect(handoff.handoffHash).toMatch(/^0x[a-f0-9]{64}$/);
    expect(handoff.handoffReceipt).toMatchObject({
      kind: 'handoff_receipt',
      hash: handoff.handoffHash,
    });
    expect(handoff.handoffReceipt.note).toContain('not an onchain transaction hash');
    expect(handoff.keeperhub.payloadPreview.owner).toBe('0x0000000000000000000000000000000000000000');
    expect(handoff.keeperhub.payloadPreview.buyToken).toMatchObject({ symbol: 'CBBTC' });
    expect(handoff.keeperhub.payloadPreview.note).toContain('handoff preview');
  });

  it('accepts an ENS wallet and uses the resolved address in payload preview', async () => {
    const resolved = '0x0000000000000000000000000000000000000001' as const;
    const handoff = await prepareKeeperHubExecution(
      {
        wallet: 'baseddesigner.eth',
        quote: paidCbbtcQuote,
        policy: { maxUsd: 5000, maxSlippageBps: 100 },
      },
      async () => resolved,
    );

    expect(handoff.wallet).toEqual({
      input: 'baseddesigner.eth',
      address: resolved,
      ensName: 'baseddesigner.eth',
    });
    expect(handoff.keeperhub.payloadPreview.owner).toBe(resolved);
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
