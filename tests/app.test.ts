import { describe, expect, it } from 'vitest';
import app from '../src/app.js';

describe('AgentPay Router app', () => {
  it('serves a shadcn-inspired landing page', async () => {
    const res = await app.request('/');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
    const html = await res.text();
    expect(html).toContain('Paid API rails for agents');
    expect(html).toContain('https://agentpay-router-zeta.vercel.app');
  });

  it('returns health', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, service: 'agentpay-router' });
  });

  it('requires payment for quote', async () => {
    const res = await app.request('/quote?sell=USDC&buy=WETH&amount=1');
    expect(res.status).toBe(402);
    expect(res.headers.get('Payment-Required')).toBeTruthy();
  });
});
