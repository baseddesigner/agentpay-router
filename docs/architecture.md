# Architecture

```txt
agent / CLI
   │
   ├─ GET /quote without payment
   │     → 402 Payment Required + payment terms
   │
   ├─ GET /quote with x-payment
   │     → live Base USDC/WETH quote
   │
   └─ POST /keeperhub/prepare-execution
         → policy checks + KeeperHub payload + audit JSON
```

## Components

- **Hono API**: small HTTP surface that runs locally and on Vercel serverless.
- **Payment gate**: x402-compatible response shape for demo mode; real facilitator verification can replace `src/x402.ts` without changing routes.
- **Quote source**: DexScreener live Base WETH/USDC market data.
- **Policy engine**: deterministic allowlist/notional/slippage checks.
- **KeeperHub handoff**: structured payload preview for direct execution or workflow webhook.

## Deployment model

Public deployment is Vercel-only. The VPS is used for development, not as a public endpoint. This avoids exposing machine IPs in the repo or demo.
