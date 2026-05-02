import { describe, expect, it } from 'vitest';
import { normalizeToken, TOKENS } from '../src/tokens.js';

describe('Base token registry', () => {
  it('supports cbBTC by symbol and Base contract address', () => {
    expect(normalizeToken('cbBTC')).toBe('CBBTC');
    expect(normalizeToken('0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf')).toBe('CBBTC');
    expect(TOKENS.CBBTC.address).toBe('0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf');
  });
});
