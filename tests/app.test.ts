import { describe, expect, it } from 'vitest';
import app from '../src/app.js';

describe('AgentPay Router app', () => {
  it('serves a concise product-first landing page with no hackathon copy', async () => {
    const res = await app.request('/');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
    const html = await res.text();
    expect(html).toContain('Paid API rails for agents');
    expect(html).toContain('Pay per request. Get live Base quotes. Send policy-checked handoffs.');
    expect(html).toContain('https://agentpay-router-zeta.vercel.app');
    expect(html).toContain('0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf');
    expect(html).toContain('POST /keeperhub/prepare-execution');
    expect(html).not.toMatch(/hackathon|judge|judges|OpenAgents|submission/i);
    expect(html.length).toBeLessThan(12000);
  });

  it('serves an OpenAPI description for agents and judges', async () => {
    const res = await app.request('/openapi.json');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/json');
    const spec = await res.json();
    expect(spec.openapi).toBe('3.1.0');
    expect(spec.info.title).toBe('AgentPay Router');
    expect(spec.paths['/quote'].get.responses['402']).toBeTruthy();
    expect(spec.paths['/quote'].get.parameters.find((param: { name: string }) => param.name === 'amount').schema.minimum).toBe(0.000001);
    expect(spec.paths['/keeperhub/prepare-execution'].post).toBeTruthy();
    expect(spec.components.schemas.HandoffRequest.required).toContain('quote');
    expect(spec.components.schemas.HandoffRequest.properties.quoteRequest).toBeUndefined();
    expect(spec.components.schemas.HandoffResponse.properties.policyChecks).toBeTruthy();
    expect(spec.components.schemas.HandoffResponse.properties.policy).toBeUndefined();
  });

  it('returns health', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, service: 'agentpay-router' });
  });

  it('rejects handoff requests that try to bypass the paid quote endpoint', async () => {
    const res = await app.request('/keeperhub/prepare-execution', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        wallet: '0x0000000000000000000000000000000000000000',
        quoteRequest: { sell: 'USDC', buy: 'CBBTC', amount: 100 },
        policy: { maxUsd: 5000, maxSlippageBps: 100 },
      }),
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: 'handoff_failed' });
  });

  it('returns inline audit summary for paid quote handoff', async () => {
    const paidQuote = await (
      await app.request('/quote?sell=USDC&buy=CBBTC&amount=100', { headers: { 'x-payment': 'demo-paid' } })
    ).json();

    const res = await app.request('/keeperhub/prepare-execution', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        wallet: '0x0000000000000000000000000000000000000000',
        quote: paidQuote,
        policy: { maxUsd: 5000, maxSlippageBps: 100 },
      }),
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('ready_for_keeperhub');
    expect(json.audit.summary).toMatchObject({ decision: 'approved', chainId: 8453, sell: 'USDC', buy: 'CBBTC' });
  });

  it('requires payment for quote', async () => {
    const res = await app.request('/quote?sell=USDC&buy=WETH&amount=1');
    expect(res.status).toBe(402);
    expect(res.headers.get('Payment-Required')).toBeTruthy();
  });
});
