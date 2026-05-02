import type { Context, MiddlewareHandler, Next } from 'hono';
import { paymentMiddleware, x402ResourceServer } from '@x402/hono';
import { HTTPFacilitatorClient } from '@x402/core/server';
import { ExactEvmScheme } from '@x402/evm/exact/server';

export type PaymentReceipt = {
  mode: 'demo' | 'external';
  status: 'settled';
  amountUsd: string;
  network: 'base';
  proof: string;
};

const DEFAULT_PRICE = '0.001';

export function paymentRequirements(origin: string) {
  return {
    x402Version: '1',
    accepts: [
      {
        scheme: 'exact',
        network: 'eip155:8453',
        price: `$${process.env.AGENTPAY_PRICE_USD ?? DEFAULT_PRICE}`,
        payTo: process.env.AGENTPAY_PAY_TO ?? '0x0000000000000000000000000000000000000000',
        asset: 'USDC',
      },
    ],
    resource: `${origin}/quote`,
    description: 'AgentPay Router live Base quote endpoint',
    mimeType: 'application/json',
  };
}

export async function requirePayment(c: Context, next: Next) {
  const payment = c.req.header('x-payment');
  const mode = process.env.AGENTPAY_PAYMENT_MODE ?? 'demo';

  // Rescue-mode hackathon path: x402-compatible 402 challenge, with a demo-paid
  // header so the public Vercel deployment can be recorded without leaking keys.
  if (mode === 'demo' && payment === 'demo-paid') {
    c.set('paymentReceipt', {
      mode: 'demo',
      status: 'settled',
      amountUsd: process.env.AGENTPAY_PRICE_USD ?? DEFAULT_PRICE,
      network: 'base',
      proof: 'demo:x-payment:demo-paid',
    } satisfies PaymentReceipt);
    return next();
  }

  const origin = new URL(c.req.url).origin;
  return c.json(
    {
      error: 'payment_required',
      message: 'Send an x-payment header to access this quote. Demo mode accepts: x-payment: demo-paid',
      paymentRequired: paymentRequirements(origin),
    },
    402,
    { 'Payment-Required': Buffer.from(JSON.stringify(paymentRequirements(origin))).toString('base64url') },
  );
}

export function createQuotePaymentMiddleware(): MiddlewareHandler {
  if (process.env.AGENTPAY_PAYMENT_MODE !== 'real') return requirePayment;

  const payTo = process.env.AGENTPAY_PAY_TO;
  if (!payTo || !/^0x[a-fA-F0-9]{40}$/.test(payTo)) {
    throw new Error('AGENTPAY_PAYMENT_MODE=real requires AGENTPAY_PAY_TO to be a valid EVM address.');
  }

  const facilitatorClient = new HTTPFacilitatorClient({
    url: process.env.X402_FACILITATOR_URL ?? 'https://x402.org/facilitator',
  });
  const resourceServer = new x402ResourceServer(facilitatorClient).register('eip155:8453', new ExactEvmScheme());

  return paymentMiddleware(
    {
      'GET /quote': {
        accepts: {
          scheme: 'exact',
          price: `$${process.env.AGENTPAY_PRICE_USD ?? DEFAULT_PRICE}`,
          network: 'eip155:8453',
          payTo,
        },
        description: 'AgentPay Router live Base quote endpoint',
        mimeType: 'application/json',
      },
    },
    resourceServer,
  );
}
