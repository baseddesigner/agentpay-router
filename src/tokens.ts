export const BASE_CHAIN_ID = 8453;

export const TOKENS = {
  USDC: {
    symbol: 'USDC',
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    decimals: 6,
  },
  WETH: {
    symbol: 'WETH',
    address: '0x4200000000000000000000000000000000000006',
    decimals: 18,
  },
} as const;

export type TokenSymbol = keyof typeof TOKENS;

export function normalizeToken(input: string): TokenSymbol {
  const upper = input.trim().toUpperCase();
  if (upper === 'ETH') return 'WETH';
  if (upper === 'USDC' || upper === 'WETH') return upper;
  throw new Error(`Unsupported token: ${input}. MVP supports USDC and WETH on Base.`);
}
