# AgentPay Router — OpenAgents Submission

## One-liner

HTTP-native paid services for agents: request → `402 Payment Required` → pay → live Base cbBTC market data → KeeperHub handoff preview.

## Links

- Live app/API: https://agentpay-router-zeta.vercel.app
- Public repo: https://github.com/baseddesigner/agentpay-router
- OpenAPI: https://agentpay-router-zeta.vercel.app/openapi.json

## What it is

AgentPay Router is a small, demoable x402-style gateway for autonomous agents. Instead of creating accounts, managing API keys, or subscribing to human dashboards, an agent can request a useful service over HTTP, receive a payment challenge, pay for that request, and continue with a structured response.

The demo service sells live Base market data, including a visible USDC → cbBTC example using the real Base cbBTC contract `0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf`, then prepares a policy-checked KeeperHub handoff preview. The handoff consumes the paid quote object returned by `/quote`; it does not fetch free quote data again.

## Demo flow

1. Agent calls `GET /quote?sell=USDC&buy=0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf&amount=100`.
2. Router returns `402 Payment Required` with a machine-readable payment challenge.
3. Agent retries with payment. In reproducible judging mode, this is `x-payment: demo-paid`.
4. Router returns live Base cbBTC market data.
5. Agent sends the paid quote object to `POST /keeperhub/prepare-execution`.
6. Router returns a KeeperHub handoff preview with policy checks and an inline audit summary.

## Run the demo

```bash
npm install
AGENTPAY_BASE_URL=https://agentpay-router-zeta.vercel.app npm run demo
```

Manual API checks:

```bash
curl https://agentpay-router-zeta.vercel.app/health
curl -i 'https://agentpay-router-zeta.vercel.app/quote?sell=USDC&buy=0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf&amount=100'
QUOTE=$(curl -s -H 'x-payment: demo-paid' 'https://agentpay-router-zeta.vercel.app/quote?sell=USDC&buy=CBBTC&amount=100')
curl -X POST https://agentpay-router-zeta.vercel.app/keeperhub/prepare-execution \
  -H 'content-type: application/json' \
  -d "{\"wallet\":\"0x0000000000000000000000000000000000000000\",\"quote\":$QUOTE,\"policy\":{\"maxUsd\":5000,\"maxSlippageBps\":100}}"
```

## What is real vs demo mode

Real:

- Hono API deployed on Vercel.
- Live Base cbBTC market data.
- `402 Payment Required` behavior for unpaid requests.
- Handoff requires a paid quote object, not a raw `quoteRequest` bypass.
- Strict quote shape validation before handoff.
- Policy checks before KeeperHub handoff preview.
- Audit summary returned inline.
- Machine-readable OpenAPI route at `/openapi.json`.
- Public repo with no VPS IPs, private paths, keys, or credentials.

Demo-mode for reproducible judging:

- Payment settlement defaults to `AGENTPAY_PAYMENT_MODE=demo`.
- Demo payment is represented by `x-payment: demo-paid` so judges can run the flow without funding a wallet.

Scaffolded upgrade path:

- Real x402 packages are wired behind `AGENTPAY_PAYMENT_MODE=real`.
- Live KeeperHub execution is intentionally not enabled by default; the app stops at a safe, auditable handoff preview rather than pretending a hackathon demo should hold signing keys.

## Why it matters

The current API economy assumes humans manage dashboards, keys, and subscriptions. Agents need request-native commerce. AgentPay Router shows the smaller primitive: useful HTTP service, priced per request, payable by the requester, composable into execution workflows.

## Built for OpenAgents

This is not a giant trading bot. It is the minimal complete proof that an agent can buy useful onchain infrastructure one HTTP request at a time.
