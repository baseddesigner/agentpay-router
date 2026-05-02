# AgentPay Router — Final Dashboard Submission Copy

## Recommended Dashboard Option

Choose: **Top Finalist & Partner Prizes**

Reason: the project is live, demoable, has a clean product story, and still remains eligible for partner prizes. There is no downside unless Max does not want to be available for possible live finalist judging on Monday.

## Project Name

AgentPay Router

## Short Description

Paid API rails for autonomous agents: request, receive HTTP 402, pay per request, get live Base market data, and prepare a policy-checked KeeperHub handoff.

## Long Description

AgentPay Router is an HTTP-native payment gateway for autonomous agents.

Today, most API products assume a human signs up, manages keys, chooses a subscription, and pays through a dashboard. Agents need a smaller primitive: make a request, receive a price, pay for that request, and continue.

AgentPay Router demonstrates that loop with a live deployed API. An agent requests a Base market quote, receives `402 Payment Required`, retries with payment, and gets live USDC → cbBTC market data using the real Base cbBTC contract. The paid quote can then be sent to a KeeperHub handoff endpoint, which validates the quote, runs policy checks, and returns a handoff preview plus inline audit summary.

The project is intentionally narrow: it is not a full trading bot and does not pretend to hold production signing keys. The core product is the paid HTTP rail between autonomous software and useful onchain services.

## What It Does

- Serves an x402-style paid HTTP quote endpoint.
- Returns machine-readable `402 Payment Required` for unpaid requests.
- Accepts a demo payment header for reproducible review.
- Returns live Base cbBTC market data after payment.
- Requires a paid quote object before KeeperHub handoff.
- Runs policy checks before handoff.
- Returns an inline audit summary.
- Exposes OpenAPI for agents and tooling.

## Links

- Live app/API: https://agentpay-router-zeta.vercel.app
- Public repo: https://github.com/baseddesigner/agentpay-router
- OpenAPI: https://agentpay-router-zeta.vercel.app/openapi.json

## Demo Instructions

```bash
npm install
AGENTPAY_BASE_URL=https://agentpay-router-zeta.vercel.app npm run demo
```

Manual checks:

```bash
curl https://agentpay-router-zeta.vercel.app/health
curl -i 'https://agentpay-router-zeta.vercel.app/quote?sell=USDC&buy=CBBTC&amount=100'
curl -H 'x-payment: demo-paid' 'https://agentpay-router-zeta.vercel.app/quote?sell=USDC&buy=CBBTC&amount=100'
```

## Built With

- Hono
- TypeScript
- Vercel
- x402-style HTTP payment flow
- Base
- cbBTC
- DexScreener market data
- KeeperHub handoff preview
- OpenAPI
- Vitest

## Real vs Demo Boundary

Real:
- Deployed API.
- Live Base cbBTC market data.
- HTTP 402 challenge for unpaid requests.
- Paid quote object required for handoff.
- Strict quote validation.
- Policy checks.
- KeeperHub payload preview.
- Inline audit summary.
- OpenAPI route.

Demo/review mode:
- Payment settlement is represented by `x-payment: demo-paid` so reviewers can run the flow without funding a wallet.
- Live signing and live KeeperHub execution are intentionally not enabled by default.

## Suggested Partner Prize Framing

Use this for any x402 / agent commerce / onchain automation / KeeperHub-aligned prize fields:

AgentPay Router focuses on the smallest useful commerce primitive for agents: paid HTTP requests. The x402-style flow makes price and payment legible at the protocol/API boundary, while the KeeperHub handoff preview shows how a paid result can move toward execution without handing signing authority to an unsafe demo.

## Final Pre-Submit Checklist

- [ ] Upload 2–4 minute demo video.
- [ ] Confirm video has voice audio and no music.
- [ ] Confirm video is 720p+.
- [ ] Add live URL.
- [ ] Add GitHub repo.
- [ ] Add OpenAPI URL if dashboard has extra link field.
- [ ] Select partner prizes.
- [ ] Click Submit after final edits.
- [ ] Re-open dashboard and confirm saved state/countdown.
