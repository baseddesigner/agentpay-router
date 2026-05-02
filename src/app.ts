import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getLiveQuote } from './quote.js';
import { createQuotePaymentMiddleware, type PaymentReceipt } from './x402.js';
import { prepareKeeperHubExecution } from './keeperhub.js';
import { writeAudit } from './audit.js';

declare module 'hono' {
  interface ContextVariableMap {
    paymentReceipt: PaymentReceipt;
  }
}

export const app = new Hono();

app.use('*', cors({ origin: '*', allowHeaders: ['Content-Type', 'X-Payment'], allowMethods: ['GET', 'POST', 'OPTIONS'] }));

app.get('/', (c) => c.json({
  name: 'AgentPay Router',
  pitch: 'Agents do not need API keys. They need HTTP services they can pay for at request time.',
  endpoints: ['/health', '/quote', '/keeperhub/prepare-execution'],
}));

app.get('/health', (c) => c.json({ ok: true, service: 'agentpay-router', network: 'base', timestamp: new Date().toISOString() }));

app.get('/quote', createQuotePaymentMiddleware(), async (c) => {
  try {
    const quote = await getLiveQuote({
      sell: c.req.query('sell') ?? 'USDC',
      buy: c.req.query('buy') ?? 'WETH',
      amount: c.req.query('amount') ?? '1',
      chainId: c.req.query('chainId') ?? '8453',
    });
    return c.json({ payment: c.get('paymentReceipt'), ...quote });
  } catch (error) {
    return c.json({ error: 'quote_failed', message: error instanceof Error ? error.message : String(error) }, 400);
  }
});

app.post('/keeperhub/prepare-execution', async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const handoff = await prepareKeeperHubExecution(body);
    const audit = await writeAudit({ ...handoff, createdAt: new Date().toISOString() });
    return c.json({ ...handoff, audit });
  } catch (error) {
    return c.json({ error: 'handoff_failed', message: error instanceof Error ? error.message : String(error) }, 400);
  }
});

export default app;
