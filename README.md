# AgentPay Router

> Agents do not need API keys. They need HTTP services they can pay for at request time.

AgentPay Router is a tiny OpenAgents hackathon submission: an x402-style paid HTTP gateway that lets an agent request live Base market data, receive `402 Payment Required`, pay per request, then pass the paid quote into a KeeperHub handoff preview with policy checks and an inline audit summary.

## What it does

- `GET /` — shadcn-inspired landing page for judges and manual upload review.
- `GET /openapi.json` — machine-readable OpenAPI spec for agents and judges.
- `GET /quote` — returns live Base WETH or cbBTC market data after payment.
- `POST /keeperhub/prepare-execution` — consumes the paid quote object from `/quote` and returns a KeeperHub handoff preview with policy checks. Wallet input can be a raw EVM address or ENS name.
- `npm run demo` — screen-recordable flow: request → 402 → paid quote → KeeperHub handoff preview.
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

The demo prints the complete agent path: unpaid request → `402 Payment Required` → paid cbBTC quote → KeeperHub handoff preview.

Manual checks:

```bash
curl https://agentpay-router-zeta.vercel.app/health
curl https://agentpay-router-zeta.vercel.app/openapi.json
curl -i 'https://agentpay-router-zeta.vercel.app/quote?sell=USDC&buy=0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf&amount=100'
QUOTE=$(curl -s -H 'x-payment: demo-paid' 'https://agentpay-router-zeta.vercel.app/quote?sell=USDC&buy=CBBTC&amount=100')
curl -X POST https://agentpay-router-zeta.vercel.app/keeperhub/prepare-execution \
  -H 'content-type: application/json' \
  -d "{\"wallet\":\"baseddesigner.eth\",\"quote\":$QUOTE,\"policy\":{\"maxUsd\":5000,\"maxSlippageBps\":100}}"
```

## API

### `GET /openapi.json`

Machine-readable OpenAPI 3.1 spec for agents, judges, and API tooling.

### `GET /quote`

Query params:
- `sell`: `USDC`, `WETH`, `CBBTC`, or the cbBTC Base contract address
- `buy`: `USDC`, `WETH`, `CBBTC`, or the cbBTC Base contract address
- `amount`: positive number
- `chainId`: defaults to Base `8453`

Without payment it returns `402` with a `Payment-Required` header. In demo mode, send `x-payment: demo-paid`.

### `POST /keeperhub/prepare-execution`

The handoff endpoint intentionally consumes the paid quote object returned by `/quote`. It does not accept a raw `quoteRequest`, because that would bypass the paid quote endpoint. `wallet` accepts either a raw EVM address or an ENS name; ENS names resolve to an EVM address before the KeeperHub payload preview is built.

```json
{
  "wallet": "baseddesigner.eth",
  "quote": {
    "payment": { "status": "settled", "mode": "demo" },
    "id": "quote_example",
    "chainId": 8453,
    "sell": "USDC",
    "buy": "CBBTC",
    "amount": "100",
    "quote": {
      "estimatedOut": "0.0012",
      "executionPrice": "0.00001200 CBBTC / USDC",
      "source": "DexScreener live Base CBBTC/USDC market data"
    },
    "route": [{ "dex": "aerodrome", "pair": "0x4e962BB3889Bf030368F56810A9c96B83CB3E778" }],
    "timestamp": "2026-05-02T18:00:00.000Z"
  },
  "policy": { "maxUsd": 5000, "maxSlippageBps": 100 }
}
```

Returns:
- paid quote
- deterministic `policyChecks`
- KeeperHub handoff preview
- deterministic handoff hash receipt
- audit JSON path plus inline `audit.summary`

## What is real vs demo mode

Real:
- Hono API deployed on Vercel.
- Live Base cbBTC market data.
- HTTP `402 Payment Required` behavior for unpaid requests.
- ENS wallet input resolution for handoff previews.
- Handoff requires a paid quote object, not a free quote request.
- Policy checks before KeeperHub handoff preview.
- Deterministic `handoffHash` receipt. This is not an onchain transaction hash.
- Audit summary returned inline.
- Machine-readable OpenAPI route at `/openapi.json`.
- Public repo with no VPS IPs, private paths, keys, or credentials.

Demo-mode for reproducible judging:
- Payment settlement defaults to `AGENTPAY_PAYMENT_MODE=demo`.
- Demo payment is represented by `x-payment: demo-paid` so judges can run the flow without funding a wallet.

Scaffolded upgrade path:
- Real x402 packages are wired behind `AGENTPAY_PAYMENT_MODE=real`.
- Live KeeperHub execution is intentionally not enabled by default; the app stops at a safe, auditable handoff preview rather than pretending a hackathon demo should hold signing keys.

## Why this matters

The web's API economy assumes humans create accounts, manage keys, and pay subscriptions. Agents need something simpler: make an HTTP request, receive a price, pay, and continue. x402 gives HTTP-native payments; KeeperHub gives a clean execution boundary.

## Submission framing

AgentPay Router is not trying to be a full trading agent. It is the smallest complete proof that agents can buy useful onchain services one HTTP request at a time.
