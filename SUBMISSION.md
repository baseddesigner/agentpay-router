# AgentPay Router — OpenAgents Submission

## One-liner

HTTP-native paid services for agents: request → `402 Payment Required` → pay → live Base quote → KeeperHub execution handoff.

## Links

- Live app/API: https://agentpay-router-zeta.vercel.app
- Public repo: https://github.com/baseddesigner/agentpay-router
- OpenAPI: https://agentpay-router-zeta.vercel.app/openapi.json

## What it is

AgentPay Router is a small, demoable x402-style gateway for autonomous agents. Instead of creating accounts, managing API keys, or subscribing to human dashboards, an agent can request a useful service over HTTP, receive a payment challenge, pay for that request, and continue with a structured response.

The demo service sells live Base market quote access, then prepares a policy-checked KeeperHub handoff so an execution agent could take over without mixing quote retrieval, payment, policy, and signing concerns.

## Demo flow

1. Agent calls `GET /quote?sell=USDC&buy=WETH&amount=1`.
2. Router returns `402 Payment Required` with a machine-readable payment challenge.
3. Agent retries with payment. In reproducible judging mode, this is `x-payment: demo-paid`.
4. Router returns a live Base quote.
5. Agent sends the quote intent to `POST /keeperhub/prepare-execution`.
6. Router returns a KeeperHub-ready payload with policy checks and an audit artifact.

## Run the demo

```bash
npm install
AGENTPAY_BASE_URL=https://agentpay-router-zeta.vercel.app npm run demo
```

Manual API checks:

```bash
curl https://agentpay-router-zeta.vercel.app/health
curl -i 'https://agentpay-router-zeta.vercel.app/quote?sell=USDC&buy=WETH&amount=1'
curl -H 'x-payment: demo-paid' 'https://agentpay-router-zeta.vercel.app/quote?sell=USDC&buy=WETH&amount=1'
curl -X POST https://agentpay-router-zeta.vercel.app/keeperhub/prepare-execution \
  -H 'content-type: application/json' \
  -d '{"wallet":"0x0000000000000000000000000000000000000000","quoteRequest":{"sell":"USDC","buy":"WETH","amount":1},"policy":{"maxUsd":5000,"maxSlippageBps":100}}'
```

## What is real vs demo mode

Real:

- Hono API deployed on Vercel.
- Live quote data for Base USDC/WETH.
- `402 Payment Required` behavior for unpaid requests.
- Policy checks before KeeperHub handoff.
- Audit artifact generation.
- Machine-readable OpenAPI route at `/openapi.json`.
- Public repo with no VPS IPs, private paths, keys, or credentials.

Demo-mode for reproducible judging:

- Payment settlement defaults to `AGENTPAY_PAYMENT_MODE=demo`.
- Demo payment is represented by `x-payment: demo-paid` so judges can run the flow without funding a wallet.

Scaffolded upgrade path:

- Real x402 packages are wired behind `AGENTPAY_PAYMENT_MODE=real`.
- Live KeeperHub execution is intentionally not enabled by default; the app stops at a safe, auditable handoff rather than pretending a hackathon demo should hold signing keys.

## Why it matters

The current API economy assumes humans manage dashboards, keys, and subscriptions. Agents need request-native commerce. AgentPay Router shows the smaller primitive: useful HTTP service, priced per request, payable by the requester, composable into execution workflows.

## Built for OpenAgents

This is not a giant trading bot. It is the minimal complete proof that an agent can buy useful onchain infrastructure one HTTP request at a time.
