import { z } from 'zod';
import { BASE_CHAIN_ID, normalizeToken, TOKENS, type TokenSymbol } from './tokens.js';

export const quoteRequestSchema = z.object({
  sell: z.string().default('USDC').transform(normalizeToken),
  buy: z.string().default('WETH').transform(normalizeToken),
  amount: z.coerce.number().positive().max(10_000).default(1),
  chainId: z.coerce.number().default(BASE_CHAIN_ID),
});

export type QuoteRequest = z.infer<typeof quoteRequestSchema>;

export type QuoteResponse = {
  id: string;
  chainId: number;
  sell: TokenSymbol;
  buy: TokenSymbol;
  amount: string;
  quote: {
    estimatedOut: string;
    executionPrice: string;
    source: string;
    pairAddress?: string;
    liquidityUsd?: number;
  };
  route: Array<{ dex: string; pair: string }>;
  timestamp: string;
};

type DexPair = {
  chainId: string;
  dexId?: string;
  pairAddress?: string;
  baseToken?: { symbol?: string; address?: string };
  quoteToken?: { symbol?: string; address?: string };
  priceUsd?: string;
  liquidity?: { usd?: number };
};

const WETH_DEXSCREENER = 'https://api.dexscreener.com/latest/dex/tokens/0x4200000000000000000000000000000000000006';

function quoteFromEthUsd(req: QuoteRequest, ethUsd: number): string {
  if (req.sell === 'USDC' && req.buy === 'WETH') return (req.amount / ethUsd).toFixed(8);
  if (req.sell === 'WETH' && req.buy === 'USDC') return (req.amount * ethUsd).toFixed(4);
  throw new Error('Unsupported route. MVP supports USDC↔WETH.');
}

function routePrice(req: QuoteRequest, ethUsd: number): string {
  if (req.sell === 'USDC' && req.buy === 'WETH') return `${(1 / ethUsd).toFixed(8)} WETH / USDC`;
  return `${ethUsd.toFixed(2)} USDC / WETH`;
}

export async function getLiveQuote(input: unknown): Promise<QuoteResponse> {
  const req = quoteRequestSchema.parse(input);
  if (req.chainId !== BASE_CHAIN_ID) throw new Error('Only Base mainnet (8453) is supported in the MVP.');
  if (req.sell === req.buy) throw new Error('sell and buy tokens must differ.');

  const res = await fetch(WETH_DEXSCREENER, { headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error(`DexScreener quote source failed: ${res.status}`);
  const body = (await res.json()) as { pairs?: DexPair[] };
  const candidates = (body.pairs ?? [])
    .filter((p) => p.chainId === 'base')
    .filter((p) => {
      const symbols = [p.baseToken?.symbol?.toUpperCase(), p.quoteToken?.symbol?.toUpperCase()];
      return symbols.includes('WETH') && symbols.includes('USDC') && Number(p.priceUsd) > 0;
    })
    .sort((a, b) => Number(b.liquidity?.usd ?? 0) - Number(a.liquidity?.usd ?? 0));
  const pair = candidates[0];
  if (!pair) throw new Error('No liquid Base WETH/USDC pair found.');

  const ethUsd = Number(pair.priceUsd);
  const estimatedOut = quoteFromEthUsd(req, ethUsd);
  const id = `quote_${Buffer.from(`${req.sell}:${req.buy}:${req.amount}:${Date.now()}`).toString('base64url').slice(0, 18)}`;

  return {
    id,
    chainId: BASE_CHAIN_ID,
    sell: req.sell,
    buy: req.buy,
    amount: String(req.amount),
    quote: {
      estimatedOut,
      executionPrice: routePrice(req, ethUsd),
      source: 'DexScreener live Base WETH/USDC market data',
      pairAddress: pair.pairAddress,
      liquidityUsd: pair.liquidity?.usd,
    },
    route: [{ dex: pair.dexId ?? 'unknown', pair: pair.pairAddress ?? 'unknown' }],
    timestamp: new Date().toISOString(),
  };
}

export function tokenAddress(symbol: TokenSymbol): string {
  return TOKENS[symbol].address;
}
