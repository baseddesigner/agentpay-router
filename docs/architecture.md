# Architecture

```txt
agent / CLI
   │
   ├─ GET /quote without payment
   │     → 402 Payment Required + payment terms
   │
   ├─ GET /quote with x-payment
   │     → live Base USDC → cbBTC market data
   │
   └─ POST /keeperhub/prepare-execution with paid quote object
         → policy checks + KeeperHub handoff preview + audit summary
```

## Components

- **Hono API**: small HTTP surface that runs locally and on Vercel serverless.
- **Payment gate**: x402-compatible response shape for demo mode; real facilitator verification can replace `src/x402.ts` without changing routes.
- **Quote source**: DexScreener live Base cbBTC/USDC market data for the hero demo, with WETH support still available.
- **Policy engine**: deterministic allowlist/notional/slippage checks.
- **KeeperHub handoff preview**: structured payload preview for a future direct execution or workflow webhook. It deliberately stops before signing or submitting live transactions.
- **Audit summary**: local/serverless audit JSON is written, and a compact summary is returned inline so Vercel demos are reviewable.

## Trust boundary

`/keeperhub/prepare-execution` consumes the paid quote object returned by `/quote`. It does not accept raw `quoteRequest` input, because that would let callers bypass the paid quote endpoint and get market data for free.

## Deployment model

Public deployment is Vercel-only. The VPS is used for development, not as a public endpoint. This avoids exposing machine IPs in the repo or demo.
