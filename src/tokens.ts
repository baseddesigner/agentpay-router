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
  CBBTC: {
    symbol: 'CBBTC',
    displaySymbol: 'cbBTC',
    address: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
    decimals: 8,
  },
} as const;

export type TokenSymbol = keyof typeof TOKENS;

const ADDRESS_TO_SYMBOL = Object.fromEntries(
  Object.entries(TOKENS).map(([symbol, token]) => [token.address.toLowerCase(), symbol as TokenSymbol]),
) as Record<string, TokenSymbol>;

export function normalizeToken(input: string): TokenSymbol {
  const trimmed = input.trim();
  const upper = trimmed.toUpperCase();
  const byAddress = ADDRESS_TO_SYMBOL[trimmed.toLowerCase()];
  if (byAddress) return byAddress;
  if (upper === 'ETH') return 'WETH';
  if (upper === 'CB-BTC' || upper === 'CBBTC' || upper === 'CBTC') return 'CBBTC';
  if (upper === 'USDC' || upper === 'WETH') return upper;
  throw new Error(`Unsupported token: ${input}. MVP supports USDC, WETH, and cbBTC on Base.`);
}
