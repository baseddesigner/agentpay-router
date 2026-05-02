const apiBase = 'https://agentpay-router-zeta.vercel.app';

const shell = String.raw;

export function landingPage() {
  return shell`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AgentPay Router — paid HTTP rails for agents</title>
  <meta name="description" content="An x402-style paid HTTP gateway for agent market quotes and KeeperHub execution handoffs." />
  <style>
    :root {
      --background: 20 14% 4%;
      --foreground: 38 28% 94%;
      --muted: 24 10% 13%;
      --muted-foreground: 35 12% 72%;
      --card: 24 13% 8%;
      --card-foreground: 38 28% 94%;
      --border: 28 10% 18%;
      --primary: 25 96% 56%;
      --primary-foreground: 24 10% 6%;
      --ring: 25 96% 56%;
      --radius: 18px;
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      min-height: 100vh;
      color: hsl(var(--foreground));
      background:
        radial-gradient(circle at 20% 0%, rgba(249, 115, 22, 0.20), transparent 32rem),
        radial-gradient(circle at 85% 12%, rgba(251, 191, 36, 0.10), transparent 28rem),
        hsl(var(--background));
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      letter-spacing: -0.01em;
    }
    a { color: inherit; text-decoration: none; }
    .container { width: min(1120px, calc(100% - 32px)); margin: 0 auto; }
    .nav { display: flex; align-items: center; justify-content: space-between; padding: 24px 0; color: hsl(var(--muted-foreground)); }
    .brand { display: flex; align-items: center; gap: 10px; color: hsl(var(--foreground)); font-weight: 650; }
    .logo { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 12px; background: hsl(var(--primary)); color: hsl(var(--primary-foreground)); box-shadow: 0 0 40px rgba(249,115,22,.34); }
    .navlinks { display: flex; align-items: center; gap: 18px; font-size: 14px; }
    .hero { padding: 72px 0 48px; display: grid; gap: 36px; grid-template-columns: 1.05fr .95fr; align-items: center; }
    .eyebrow { display: inline-flex; align-items: center; gap: 8px; padding: 7px 10px; border: 1px solid hsl(var(--border)); border-radius: 999px; background: rgba(255,255,255,.03); color: hsl(var(--muted-foreground)); font-size: 13px; }
    h1 { margin: 18px 0 18px; max-width: 760px; font-size: clamp(44px, 8vw, 86px); line-height: .92; letter-spacing: -.07em; }
    .lead { max-width: 650px; color: hsl(var(--muted-foreground)); font-size: clamp(18px, 2vw, 21px); line-height: 1.6; }
    .actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 28px; }
    .button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 44px; padding: 0 18px; border-radius: 999px; border: 1px solid hsl(var(--border)); font-size: 14px; font-weight: 650; transition: transform .18s ease, border-color .18s ease, background .18s ease; }
    .button:hover { transform: translateY(-1px); border-color: hsl(var(--primary) / .7); }
    .button.primary { background: hsl(var(--primary)); color: hsl(var(--primary-foreground)); border-color: transparent; box-shadow: 0 10px 34px rgba(249,115,22,.18); }
    .card { border: 1px solid hsl(var(--border)); background: linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.025)); border-radius: var(--radius); box-shadow: 0 24px 80px rgba(0,0,0,.28); }
    .terminal { overflow: hidden; }
    .terminalbar { display: flex; gap: 7px; padding: 14px 16px; border-bottom: 1px solid hsl(var(--border)); }
    .dot { width: 10px; height: 10px; border-radius: 50%; background: hsl(var(--muted-foreground)); opacity: .45; }
    pre { margin: 0; padding: 22px; overflow: auto; color: #f8fafc; font: 13px/1.75 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    .accent { color: hsl(var(--primary)); }
    .grid { display: grid; gap: 16px; grid-template-columns: repeat(3, 1fr); margin: 36px 0; }
    .feature { padding: 22px; }
    .feature h3, .section h2 { margin: 0 0 10px; letter-spacing: -.035em; }
    .feature p, .section p { margin: 0; color: hsl(var(--muted-foreground)); line-height: 1.6; }
    .section { padding: 28px; margin: 18px 0; }
    .flow { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-top: 20px; }
    .step { min-height: 92px; padding: 16px; border-radius: 16px; background: hsl(var(--muted)); border: 1px solid hsl(var(--border)); }
    .step span { display: block; color: hsl(var(--primary)); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 8px; }
    .code { flex: 1; min-width: 0; padding: 14px 16px; color: #fed7aa; font: 13px/1.6 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; overflow: auto; }
    .command { display: flex; align-items: stretch; gap: 8px; border-radius: 14px; background: rgba(0,0,0,.34); border: 1px solid hsl(var(--border)); overflow: hidden; }
    .copy { border: 0; border-left: 1px solid hsl(var(--border)); padding: 0 14px; background: rgba(255,255,255,.04); color: hsl(var(--muted-foreground)); font-weight: 650; cursor: pointer; }
    .copy:hover { color: hsl(var(--foreground)); background: rgba(255,255,255,.07); }
    footer { padding: 42px 0 60px; color: hsl(var(--muted-foreground)); font-size: 14px; }
    @media (max-width: 860px) { .hero, .grid, .flow { grid-template-columns: 1fr; } .navlinks { display: none; } .hero { padding-top: 36px; } }
  </style>
</head>
<body>
  <main class="container">
    <nav class="nav">
      <a class="brand" href="/"><span class="logo">↯</span><span>AgentPay Router</span></a>
      <div class="navlinks">
        <a href="#flow">Flow</a>
        <a href="#try">Try it</a>
        <a href="#examples">Examples</a>
        <a href="https://github.com/baseddesigner/agentpay-router">GitHub</a>
      </div>
    </nav>

    <section class="hero">
      <div>
        <span class="eyebrow">x402-style HTTP payments · Base quotes · KeeperHub handoff</span>
        <h1>Paid API rails for agents.</h1>
        <p class="lead">Agents should not need accounts, dashboards, API keys, or subscription plans for every small service. They should make an HTTP request, receive <strong>402 Payment Required</strong>, pay, and continue.</p>
        <div class="actions">
          <a class="button primary" href="#try">Try the live API</a>
          <a class="button" href="https://github.com/baseddesigner/agentpay-router">View repo</a>
        </div>
      </div>
      <div class="card terminal" aria-label="terminal demo">
        <div class="terminalbar"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
        <pre><span class="accent">$</span> curl -i /quote?sell=USDC&buy=WETH
HTTP/2 402 Payment Required
payment-required: eyJ4NDAyVmVyc2lvbiI...

<span class="accent">$</span> curl -H 'x-payment: demo-paid' /quote
{
  "payment": { "status": "settled" },
  "quote": { "source": "DexScreener live Base" },
  "route": [{ "dex": "uniswap" }]
}</pre>
      </div>
    </section>

    <section class="grid">
      <article class="card feature"><h3>HTTP-native payment</h3><p>Unpaid requests receive a machine-readable 402 challenge. Demo mode accepts an explicit payment header for reproducible judging.</p></article>
      <article class="card feature"><h3>Live market quote</h3><p>Paid requests return a Base USDC/WETH quote with route metadata instead of a fake JSON toy response.</p></article>
      <article class="card feature"><h3>Execution handoff</h3><p>KeeperHub payload previews include policy checks, route data, token addresses, and an audit artifact.</p></article>
    </section>

    <section id="flow" class="card section">
      <h2>One request becomes an execution-ready handoff.</h2>
      <p>The hackathon demo keeps the path narrow on purpose: make payment legible, keep secrets out of the public repo, and avoid pretending a demo should hold trading keys.</p>
      <div class="flow">
        <div class="step"><span>01</span>Agent asks for quote</div>
        <div class="step"><span>02</span>Router returns HTTP 402</div>
        <div class="step"><span>03</span>Agent pays per request</div>
        <div class="step"><span>04</span>Router returns Base quote</div>
        <div class="step"><span>05</span>KeeperHub handoff is prepared</div>
      </div>
    </section>

    <section id="try" class="card section">
      <h2>Try the deployed API.</h2>
      <p>Production is hosted on Vercel. No VPS address is embedded in the repo or demo.</p>
      <div class="command"><div class="code">curl ${apiBase}/health</div><button class="copy" data-copy="curl ${apiBase}/health">Copy</button></div>
      <br />
      <div class="command"><div class="code">curl -i '${apiBase}/quote?sell=USDC&amp;buy=WETH&amp;amount=1'</div><button class="copy" data-copy="curl -i '${apiBase}/quote?sell=USDC&buy=WETH&amount=1'">Copy</button></div>
      <br />
      <div class="command"><div class="code">curl -H 'x-payment: demo-paid' '${apiBase}/quote?sell=USDC&amp;buy=WETH&amp;amount=1'</div><button class="copy" data-copy="curl -H 'x-payment: demo-paid' '${apiBase}/quote?sell=USDC&buy=WETH&amount=1'">Copy</button></div>
    </section>
    <section id="examples" class="card section">
      <h2>Examples agents can copy.</h2>
      <p>Three concrete calls cover the full demo narrative: unpaid request, paid quote, and KeeperHub execution handoff.</p>
      <br />
      <div class="command"><div class="code">GET /quote → 402 Payment Required</div><button class="copy" data-copy="curl -i '${apiBase}/quote?sell=USDC&buy=WETH&amount=1'">Copy</button></div>
      <br />
      <div class="command"><div class="code">GET /quote with x-payment → live Base quote</div><button class="copy" data-copy="curl -H 'x-payment: demo-paid' '${apiBase}/quote?sell=USDC&buy=WETH&amount=1'">Copy</button></div>
      <br />
      <div class="command"><div class="code">POST /keeperhub/prepare-execution → policy-checked handoff</div><button class="copy" data-copy='curl -X POST ${apiBase}/keeperhub/prepare-execution -H "content-type: application/json" -d "{\"wallet\":\"0x0000000000000000000000000000000000000000\",\"quoteRequest\":{\"sell\":\"USDC\",\"buy\":\"WETH\",\"amount\":1},\"policy\":{\"maxUsd\":5000,\"maxSlippageBps\":100}}"'>Copy</button></div>
    </section>
  </main>
  <footer class="container">Built for OpenAgents. Small surface area, honest demo mode, clean upgrade path to live x402 settlement.</footer>
  <script>
    async function copyText(text) {
      if (navigator.clipboard && window.isSecureContext) {
        try {
          await navigator.clipboard.writeText(text);
          return;
        } catch (_error) {
          // Browser automation and some embedded contexts deny clipboard even on HTTPS.
          // Fall through to the old-school selected textarea path.
        }
      }
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }

    for (const button of document.querySelectorAll('.copy')) {
      button.addEventListener('click', async () => {
        const label = button.textContent;
        try {
          await copyText(button.dataset.copy || '');
          button.textContent = 'Copied';
        } catch (_error) {
          button.textContent = 'Copy failed';
        }
        setTimeout(() => { button.textContent = label; }, 1200);
      });
    }
  </script>
</body>
</html>`;
}
