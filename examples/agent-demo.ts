import 'dotenv/config';
import app from '../src/app.js';

const remoteBase = process.env.AGENTPAY_BASE_URL;

async function request(path: string, init?: RequestInit) {
  if (remoteBase) return fetch(new URL(path, remoteBase), init);
  return app.request(path, init);
}

async function printStep(title: string, res: Response) {
  const json = await res.json();
  console.log(`\n## ${title}`);
  console.log(`status: ${res.status}`);
  console.log(JSON.stringify(json, null, 2));
  return json;
}

console.log('AgentPay Router demo');
console.log('Agents do not need API keys. They need HTTP services they can pay for at request time.');
console.log(remoteBase ? `target: ${remoteBase}` : 'target: in-process local app');

await printStep('1. health check', await request('/health'));

await printStep('2. unpaid request returns HTTP 402', await request('/quote?sell=USDC&buy=0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf&amount=100'));

const paidQuote = await printStep(
  '3. paid x402-style request returns live Base cbBTC quote',
  await request('/quote?sell=USDC&buy=CBBTC&amount=100', { headers: { 'x-payment': 'demo-paid' } }),
);

await printStep(
  '4. KeeperHub handoff receipt + audit summary',
  await request('/keeperhub/prepare-execution', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      wallet: 'baseddesigner.eth',
      quote: paidQuote,
      policy: { maxUsd: 5000, maxSlippageBps: 100 },
    }),
  }),
);

console.log('\nDone. This is the recordable flow: request → 402 → paid quote → handoff receipt → KeeperHub payload preview.');
