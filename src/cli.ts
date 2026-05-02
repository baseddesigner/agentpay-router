import 'dotenv/config';
import { Command } from 'commander';

const program = new Command();
program.name('agentpay').description('AgentPay Router CLI demo').version('0.1.0');

program
  .command('quote')
  .option('--base-url <url>', 'router URL', process.env.AGENTPAY_BASE_URL ?? 'http://localhost:3000')
  .option('--sell <symbol>', 'sell token', 'USDC')
  .option('--buy <symbol>', 'buy token', 'WETH')
  .option('--amount <amount>', 'sell amount', '1')
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
  .option('--wallet <address>', 'agent wallet', '0x0000000000000000000000000000000000000000')
  .option('--amount <amount>', 'USDC notional', '1')
  .action(async (opts) => {
    const res = await fetch(new URL('/keeperhub/prepare-execution', opts.baseUrl), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ wallet: opts.wallet, quoteRequest: { sell: 'USDC', buy: 'WETH', amount: Number(opts.amount) }, policy: { maxUsd: 10, maxSlippageBps: 100 } }),
    });
    console.log(`status: ${res.status}`);
    console.log(JSON.stringify(await res.json(), null, 2));
  });

program.parseAsync();
