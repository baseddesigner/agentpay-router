# Demo Script

1. Open with the problem:
   - Agents should not need API keys, accounts, or subscriptions for every small HTTP service.
   - They should pay at request time.
   - This demo uses cbBTC on Base so the request is visibly real, not placeholder JSON.

2. Show unpaid request:

```bash
curl -i "$AGENTPAY_BASE_URL/quote?sell=USDC&buy=0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf&amount=100"
```

Point out `402 Payment Required` and the machine-readable payment challenge.

3. Show paid request locally or against the Vercel deployment:

```bash
curl -H 'x-payment: demo-paid' 'http://localhost:3000/quote?sell=USDC&buy=CBBTC&amount=100'
curl -H 'x-payment: demo-paid' 'https://agentpay-router-zeta.vercel.app/quote?sell=USDC&buy=CBBTC&amount=100'
```

Point out live Base cbBTC market data and the demo payment receipt.

4. Show KeeperHub handoff preview:

```bash
npm run demo
```

Point out that the handoff consumes the paid quote object from step 3. It does not fetch a free quote again. Then point out policy checks, KeeperHub payload preview, and inline audit summary.

5. Say the honest boundary:
   - Real: deployed API, live Base data, 402 challenge, strict paid quote handoff, policy checks, OpenAPI, audit summaries.
   - Demo: settlement uses `x-payment: demo-paid` for reproducible judging.
   - Not pretending: no live signing or KeeperHub execution by default.

6. Close:
   - AgentPay Router proves the loop: request → price → payment → useful result → safe execution handoff preview.
