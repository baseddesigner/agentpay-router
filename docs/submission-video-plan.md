# AgentPay Router — 2–4 Minute Demo Video Plan

Deadline: Sunday May 3, 2026, 12:00pm ET / 5:00pm Lisbon.

Target length: 2:45–3:15. Export minimum: 720p. Audio: voice only, no music.

## Recording Setup

- Browser: https://agentpay-router-zeta.vercel.app
- Terminal size: large readable font, 1280×720 or higher.
- Use deployed URL for credibility:

```bash
cd /root/agentpay-router
AGENTPAY_BASE_URL=https://agentpay-router-zeta.vercel.app npm run demo
```

- Keep the public repo tab ready: https://github.com/baseddesigner/agentpay-router
- Keep OpenAPI tab ready: https://agentpay-router-zeta.vercel.app/openapi.json

## Storyboard

### 0:00–0:20 — Product hook

Screen: landing page hero.

Voice:
> This is AgentPay Router: paid API rails for autonomous agents. Instead of accounts, dashboards, API keys, and subscriptions, an agent can make an HTTP request, receive a 402 payment challenge, pay for that request, and continue.

### 0:20–0:45 — Product surface

Screen: scroll through landing cards and flow.

Voice:
> The live example sells Base market data. It uses the real cbBTC contract on Base, then turns the paid quote into a policy-checked KeeperHub handoff preview.

Point at:
- 402 first
- Live quotes
- Safe handoff
- cbBTC contract

### 0:45–1:25 — Show unpaid request → 402

Screen: terminal.

Run:

```bash
curl -i 'https://agentpay-router-zeta.vercel.app/quote?sell=USDC&buy=CBBTC&amount=100'
```

Voice:
> First, the agent asks for a quote without payment. The router returns HTTP 402 Payment Required with a machine-readable payment challenge. This is the key primitive: the service can price a request directly over HTTP.

### 1:25–2:05 — Show paid request → live quote

Run:

```bash
curl -H 'x-payment: demo-paid' 'https://agentpay-router-zeta.vercel.app/quote?sell=USDC&buy=CBBTC&amount=100'
```

Voice:
> Now the agent retries with payment. For the demo, settlement is represented by this explicit payment header. The response includes a settled payment receipt and live Base cbBTC market data from DexScreener, including route and pair information.

Point at:
- `payment.status: settled`
- `buy: CBBTC`
- `source: DexScreener live Base CBBTC/USDC`
- `route`

### 2:05–2:50 — Full flow + KeeperHub handoff

Run:

```bash
AGENTPAY_BASE_URL=https://agentpay-router-zeta.vercel.app npm run demo
```

Voice:
> The full flow is request, 402, paid quote, then KeeperHub handoff. The handoff endpoint does not accept a free quote request. It consumes the paid quote object, validates it, runs policy checks, and returns a KeeperHub payload preview plus an inline audit summary.

Point at:
- `ready_for_keeperhub`
- `policyChecks`
- `payloadPreview`
- `audit.summary`

### 2:50–3:15 — Close

Screen: repo or OpenAPI.

Voice:
> The project is deployed, documented, and machine-readable through OpenAPI. The live version stops at a safe handoff preview instead of pretending to hold trading keys. The core proof is simple: agents can buy useful onchain infrastructure one HTTP request at a time.

## Must Say Clearly

- AgentPay Router is a product, not a trading bot.
- Payment is per request via an x402-style 402 flow.
- The quote uses real Base cbBTC market data.
- KeeperHub is a safe handoff preview, not live signing by default.
- Demo settlement uses `x-payment: demo-paid` for reproducible review.

## Avoid Saying

- “Execution-ready swap” unless showing real calldata/minOut/signing.
- “Live KeeperHub execution” unless actual execution is wired.
- “Bot trading autonomously.” That is not the wedge.
- Any private infra, VPS, Tailscale, keys, or internal paths.

## Quick Recording Checklist

- [ ] Video length between 2:00 and 4:00.
- [ ] 720p or better.
- [ ] Voice audio present.
- [ ] No music.
- [ ] Deployed URL visible.
- [ ] 402 response visible.
- [ ] Paid quote visible.
- [ ] KeeperHub handoff/audit visible.
- [ ] Public repo or OpenAPI visible.
- [ ] No private terminal history/secrets visible.
