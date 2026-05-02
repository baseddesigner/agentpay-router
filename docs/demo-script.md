# Demo Script

1. Open with the problem:
   - Agents should not need API keys, accounts, or subscriptions for every small HTTP service.
   - They should pay at request time.

2. Show unpaid request:

```bash
curl -i "$AGENTPAY_BASE_URL/quote?sell=USDC&buy=WETH&amount=1"
```

Point out `402 Payment Required`.

3. Show paid request locally or against the Vercel deployment:

```bash
curl -H 'x-payment: demo-paid' 'http://localhost:3000/quote?sell=USDC&buy=WETH&amount=1'
curl -H 'x-payment: demo-paid' 'https://agentpay-router-zeta.vercel.app/quote?sell=USDC&buy=WETH&amount=1'
```

Point out live Base quote data.

4. Show KeeperHub handoff:

```bash
npm run demo
```

Point out policy checks, KeeperHub payload, and audit artifact.

5. Close:
   - AgentPay Router proves the loop: request → price → payment → useful result → execution-ready handoff.
