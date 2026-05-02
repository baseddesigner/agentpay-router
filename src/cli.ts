import 'dotenv/config';
import { Command } from 'commander';

const program = new Command();
program.name('agentpay').description('AgentPay Router CLI demo').version('0.1.0');

program
  .command('quote')
  .option('--base-url <url>', 'router URL', process.env.AGENTPAY_BASE_URL ?? 'http://localhost:3000')
  .option('--sell <symbol>', 'sell token', 'USDC')
  .option('--buy <symbol>', 'buy token', 'CBBTC')
  .option('--amount <amount>', 'sell amount', '100')
  .option('--paid', 'send demo payment header')
  .action(async (opts) => {
    const url = new URL('/quote', opts.baseUrl);
    url.searchParams.set('sell', opts.sell);
    url.searchParams.set('buy', opts.buy);
    url.searchParams.set('amount', opts.amount);
    const res = await fetch(url, { headers: opts.paid ? { 'x-payment': 'demo-paid' } : {} });
    console.log(`GET ${url.toString()}`);
    console.log(`status: ${res.status}`);
    console.log(JSON.stringify(await res.json(), null, 2));
  });

program
  .command('prepare')
  .option('--base-url <url>', 'router URL', process.env.AGENTPAY_BASE_URL ?? 'http://localhost:3000')
  .option('--wallet <address-or-ens>', 'agent wallet address or ENS name', '0x0000000000000000000000000000000000000000')
  .option('--amount <amount>', 'USDC notional', '100')
  .action(async (opts) => {
    const quoteUrl = new URL('/quote', opts.baseUrl);
    quoteUrl.searchParams.set('sell', 'USDC');
    quoteUrl.searchParams.set('buy', 'CBBTC');
    quoteUrl.searchParams.set('amount', opts.amount);
    const quoteRes = await fetch(quoteUrl, { headers: { 'x-payment': 'demo-paid' } });
    const quote = await quoteRes.json();
    if (!quoteRes.ok) {
      console.log(`quote status: ${quoteRes.status}`);
      console.log(JSON.stringify(quote, null, 2));
      process.exitCode = 1;
      return;
    }

    const res = await fetch(new URL('/keeperhub/prepare-execution', opts.baseUrl), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ wallet: opts.wallet, quote, policy: { maxUsd: 5000, maxSlippageBps: 100 } }),
    });
    console.log(`status: ${res.status}`);
    console.log(JSON.stringify(await res.json(), null, 2));
  });

program.parseAsync();
