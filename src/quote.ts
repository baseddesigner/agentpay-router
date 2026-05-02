import { z } from 'zod';
import { BASE_CHAIN_ID, normalizeToken, TOKENS, type TokenSymbol } from './tokens.js';

export const quoteRequestSchema = z.object({
  sell: z.string().default('USDC').transform(normalizeToken),
  buy: z.string().default('CBBTC').transform(normalizeToken),
  amount: z.coerce.number().positive().max(10_000).default(1),
  chainId: z.coerce.number().default(BASE_CHAIN_ID),
});

export type QuoteRequest = z.infer<typeof quoteRequestSchema>;

export const routeLegSchema = z.object({
  dex: z.string().min(1),
  pair: z.string().min(1),
});

export const quoteResponseSchema = z
  .object({
    id: z.string().regex(/^quote_[A-Za-z0-9_-]+$/),
    chainId: z.literal(BASE_CHAIN_ID),
    sell: z.enum(['USDC', 'WETH', 'CBBTC']),
    buy: z.enum(['USDC', 'WETH', 'CBBTC']),
    amount: z.string().refine((value) => Number(value) > 0, 'amount must be positive'),
    quote: z.object({
      estimatedOut: z.string().refine((value) => Number(value) > 0, 'estimatedOut must be positive'),
      executionPrice: z.string().min(1),
      source: z.string().min(1),
      pairAddress: z.string().optional(),
      liquidityUsd: z.number().optional(),
    }),
    route: z.array(routeLegSchema).min(1),
    timestamp: z.string().datetime(),
  })
  .passthrough();

export const paidQuoteResponseSchema = quoteResponseSchema
  .extend({
    payment: z
      .object({
        status: z.literal('settled'),
      })
      .passthrough(),
  })
  .passthrough();

export type QuoteResponse = z.infer<typeof quoteResponseSchema>;
export type PaidQuoteResponse = z.infer<typeof paidQuoteResponseSchema>;

type DexPair = {
  chainId: string;
  dexId?: string;
  pairAddress?: string;
  baseToken?: { symbol?: string; address?: string };
  quoteToken?: { symbol?: string; address?: string };
  priceUsd?: string;
  liquidity?: { usd?: number };
};

function dexscreenerTokenUrl(symbol: TokenSymbol): string {
  return `https://api.dexscreener.com/latest/dex/tokens/${TOKENS[symbol].address}`;
}

function pairContains(pair: DexPair, symbol: TokenSymbol): boolean {
  const tokenAddress = TOKENS[symbol].address.toLowerCase();
  const symbols = [pair.baseToken?.symbol?.toUpperCase(), pair.quoteToken?.symbol?.toUpperCase()];
  const addresses = [pair.baseToken?.address?.toLowerCase(), pair.quoteToken?.address?.toLowerCase()];
  return symbols.includes(symbol) || addresses.includes(tokenAddress);
}

function liquidUsdcPair(pair: DexPair, symbol: TokenSymbol): boolean {
  return pair.chainId === 'base' && pairContains(pair, symbol) && pairContains(pair, 'USDC') && Number(pair.priceUsd) > 0;
}

async function tokenUsdMarket(symbol: TokenSymbol): Promise<{ priceUsd: number; pair: DexPair }> {
  if (symbol === 'USDC') return { priceUsd: 1, pair: { chainId: 'base', dexId: 'stable', pairAddress: 'USDC', priceUsd: '1', liquidity: { usd: 1 } } };

  const res = await fetch(dexscreenerTokenUrl(symbol), { headers: { accept: 'application/json', 'user-agent': 'AgentPay Router' } });
  if (!res.ok) throw new Error(`DexScreener quote source failed: ${res.status}`);
  const body = (await res.json()) as { pairs?: DexPair[] };
  const pair = (body.pairs ?? [])
    .filter((p) => liquidUsdcPair(p, symbol))
    .sort((a, b) => Number(b.liquidity?.usd ?? 0) - Number(a.liquidity?.usd ?? 0))[0];
  if (!pair) throw new Error(`No liquid Base ${symbol}/USDC pair found.`);

  return { priceUsd: Number(pair.priceUsd), pair };
}

function estimatedOut(req: QuoteRequest, tokenUsd: number): string {
  if (req.sell === 'USDC') return (req.amount / tokenUsd).toFixed(req.buy === 'CBBTC' ? 8 : 8);
  if (req.buy === 'USDC') return (req.amount * tokenUsd).toFixed(4);
  throw new Error('Unsupported route. MVP supports USDC↔WETH and USDC↔cbBTC on Base.');
}

function routePrice(req: QuoteRequest, tokenUsd: number): string {
  if (req.sell === 'USDC') return `${(1 / tokenUsd).toFixed(8)} ${req.buy} / USDC`;
  return `${tokenUsd.toFixed(2)} USDC / ${req.sell}`;
}

export async function getLiveQuote(input: unknown): Promise<QuoteResponse> {
  const req = quoteRequestSchema.parse(input);
  if (req.chainId !== BASE_CHAIN_ID) throw new Error('Only Base mainnet (8453) is supported in the MVP.');
  if (req.sell === req.buy) throw new Error('sell and buy tokens must differ.');
  if (req.sell !== 'USDC' && req.buy !== 'USDC') {
    throw new Error('Unsupported route. MVP supports USDC↔WETH and USDC↔cbBTC on Base.');
  }

  const pricedToken = req.sell === 'USDC' ? req.buy : req.sell;
  const market = await tokenUsdMarket(pricedToken);
  const out = estimatedOut(req, market.priceUsd);
  const id = `quote_${Buffer.from(`${req.sell}:${req.buy}:${req.amount}:${Date.now()}`).toString('base64url').slice(0, 18)}`;

  return {
    id,
    chainId: BASE_CHAIN_ID,
    sell: req.sell,
    buy: req.buy,
    amount: String(req.amount),
    quote: {
      estimatedOut: out,
      executionPrice: routePrice(req, market.priceUsd),
      source: `DexScreener live Base ${pricedToken}/USDC market data`,
      pairAddress: market.pair.pairAddress,
      liquidityUsd: market.pair.liquidity?.usd,
    },
    route: [{ dex: market.pair.dexId ?? 'unknown', pair: market.pair.pairAddress ?? 'unknown' }],
    timestamp: new Date().toISOString(),
  };
}

export function tokenAddress(symbol: TokenSymbol): string {
  return TOKENS[symbol].address;
}
