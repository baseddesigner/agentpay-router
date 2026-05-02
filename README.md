# AgentPay Router

> Agents do not need API keys. They need HTTP services they can pay for at request time.

AgentPay Router is a tiny OpenAgents hackathon submission: an x402-style paid HTTP gateway that lets an agent request live Base market data, receive `402 Payment Required`, pay per request, then receive an execution-ready KeeperHub handoff with policy checks and an audit artifact.

## What it does

- `GET /` — shadcn-inspired landing page for judges and manual upload review.
- `GET /openapi.json` — machine-readable OpenAPI spec for agents and judges.
- `GET /quote` — returns live Base USDC/WETH quote data after payment.
- `POST /keeperhub/prepare-execution` — turns the quote into a KeeperHub-ready handoff with policy checks.
- `npm run demo` — screen-recordable flow: request → 402 → paid quote → KeeperHub handoff.
- Vercel-first deploy — no VPS IPs or private infra in the public repo.

## Live deployment

- Production API: https://agentpay-router-zeta.vercel.app
- Public repo: https://github.com/baseddesigner/agentpay-router
- OpenAPI: https://agentpay-router-zeta.vercel.app/openapi.json

No VPS address is embedded in the repo or deployment. The public demo runs from a fresh Vercel project.

## Demo

One-command live demo against the deployed Vercel app:

```bash
npm install
AGENTPAY_BASE_URL=https://agentpay-router-zeta.vercel.app npm run demo
```

Local demo:

```bash
npm install
npm run demo
```

The demo prints the complete agent path: unpaid request → `402 Payment Required` → paid quote → KeeperHub handoff.

Manual checks:

```bash
curl https://agentpay-router-zeta.vercel.app/health
curl https://agentpay-router-zeta.vercel.app/openapi.json
curl -i 'https://agentpay-router-zeta.vercel.app/quote?sell=USDC&buy=WETH&amount=1'
curl -H 'x-payment: demo-paid' 'https://agentpay-router-zeta.vercel.app/quote?sell=USDC&buy=WETH&amount=1'
curl -X POST https://agentpay-router-zeta.vercel.app/keeperhub/prepare-execution \
  -H 'content-type: application/json' \
  -d '{"wallet":"0x0000000000000000000000000000000000000000","quoteRequest":{"sell":"USDC","buy":"WETH","amount":1},"policy":{"maxUsd":5000,"maxSlippageBps":100}}'
```

## API

### `GET /openapi.json`

Machine-readable OpenAPI 3.1 spec for agents, judges, and API tooling.

### `GET /quote`

Query params:
- `sell`: `USDC` or `WETH`
- `buy`: `USDC` or `WETH`
- `amount`: positive number
- `chainId`: defaults to Base `8453`

Without payment it returns `402` with a `Payment-Required` header. In demo mode, send `x-payment: demo-paid`.

### `POST /keeperhub/prepare-execution`

```json
{
  "wallet": "0x0000000000000000000000000000000000000000",
  "quoteRequest": { "sell": "USDC", "buy": "WETH", "amount": 1 },
  "policy": { "maxUsd": 10, "maxSlippageBps": 100 }
}
```

Returns:
- quote
- deterministic policy checks
- KeeperHub direct/workflow payload preview
- audit JSON path

## Why this matters

The web's API economy assumes humans create accounts, manage keys, and pay subscriptions. Agents need something simpler: make an HTTP request, receive a price, pay, and continue. x402 gives HTTP-native payments; KeeperHub gives a clean execution handoff.

## Security / public repo hygiene

- No VPS IPs are used in the app or docs.
- No private keys or API keys are committed.
- `.env.example` contains placeholders only.
- Live KeeperHub execution is deliberately gated behind `KH_API_KEY`; the default is a safe handoff.
- Demo payment mode is explicit and isolated for hackathon recording.

## Submission framing

AgentPay Router is not trying to be a full trading agent. It is the smallest complete proof that agents can buy useful onchain services one HTTP request at a time.
