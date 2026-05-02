import { describe, expect, it } from 'vitest';
import { resolveWallet } from '../src/ens.js';

const zeroOne = '0x0000000000000000000000000000000000000001' as const;

describe('resolveWallet', () => {
  it('passes raw EVM addresses through', async () => {
    await expect(resolveWallet(zeroOne)).resolves.toEqual({ address: zeroOne });
  });

  it('resolves ENS names using an injected resolver', async () => {
    const result = await resolveWallet('BasedDesigner.eth', async (name) => {
      expect(name).toBe('baseddesigner.eth');
      return zeroOne;
    });

    expect(result).toEqual({
      input: 'BasedDesigner.eth',
      address: zeroOne,
      ensName: 'baseddesigner.eth',
    });
  });

  it('rejects unresolved ENS names clearly', async () => {
    await expect(resolveWallet('missing.eth', async () => null)).rejects.toThrow(/did not resolve/i);
  });

  it('rejects non-address non-ENS wallet inputs', async () => {
    await expect(resolveWallet('not-a-wallet')).rejects.toThrow(/EVM address or ENS name/i);
  });
});
