const apiBase = 'https://agentpay-router-zeta.vercel.app';

const shell = String.raw;

export function landingPage() {
  return shell`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AgentPay Router — paid API rails for agents</title>
  <meta name="description" content="Paid HTTP rails for agents: x402-style requests, live Base quotes, and policy-checked KeeperHub handoffs." />
  <style>
    :root { --bg: 20 14% 4%; --fg: 38 28% 94%; --muted: 35 12% 72%; --card: 24 13% 8%; --border: 28 10% 18%; --orange: 25 96% 56%; --dark: 24 10% 6%; --r: 18px; }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body { margin: 0; min-height: 100vh; color: hsl(var(--fg)); background: radial-gradient(circle at 20% 0%, rgba(249,115,22,.2), transparent 32rem), radial-gradient(circle at 85% 12%, rgba(251,191,36,.1), transparent 28rem), hsl(var(--bg)); font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; letter-spacing: -.01em; }
    a { color: inherit; text-decoration: none; }
    code { color: #fed7aa; }
    .container { width: min(1120px, calc(100% - 32px)); margin: 0 auto; }
    .nav { display: flex; align-items: center; justify-content: space-between; padding: 24px 0; color: hsl(var(--muted)); }
    .brand { display: flex; align-items: center; gap: 10px; color: hsl(var(--fg)); font-weight: 700; }
    .logo { display: grid; place-items: center; width: 34px; height: 34px; border-radius: 12px; background: hsl(var(--orange)); color: hsl(var(--dark)); box-shadow: 0 0 40px rgba(249,115,22,.34); }
    .navlinks { display: flex; align-items: center; gap: 18px; font-size: 14px; }
    .hero { padding: 72px 0 48px; display: grid; gap: 36px; grid-template-columns: 1.05fr .95fr; align-items: center; }
    .eyebrow { display: inline-flex; padding: 7px 10px; border: 1px solid hsl(var(--border)); border-radius: 999px; background: rgba(255,255,255,.03); color: hsl(var(--muted)); font-size: 13px; }
    h1 { margin: 18px 0; max-width: 760px; font-size: clamp(44px, 8vw, 86px); line-height: .92; letter-spacing: -.07em; }
    .lead { max-width: 620px; color: hsl(var(--muted)); font-size: clamp(18px, 2vw, 21px); line-height: 1.5; }
    .actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 28px; }
    .button { display: inline-flex; align-items: center; justify-content: center; height: 44px; padding: 0 18px; border-radius: 999px; border: 1px solid hsl(var(--border)); font-size: 14px; font-weight: 700; transition: transform .18s ease, border-color .18s ease; }
    .button:hover { transform: translateY(-1px); border-color: hsl(var(--orange) / .7); }
    .button.primary { background: hsl(var(--orange)); color: hsl(var(--dark)); border-color: transparent; box-shadow: 0 10px 34px rgba(249,115,22,.18); }
    .card { border: 1px solid hsl(var(--border)); background: linear-gradient(180deg, rgba(255,255,255,.055), rgba(255,255,255,.025)); border-radius: var(--r); box-shadow: 0 24px 80px rgba(0,0,0,.28); }
    .terminal { overflow: hidden; }
    .terminalbar { display: flex; gap: 7px; padding: 14px 16px; border-bottom: 1px solid hsl(var(--border)); }
    .dot { width: 10px; height: 10px; border-radius: 50%; background: hsl(var(--muted)); opacity: .45; }
    pre { margin: 0; padding: 22px; overflow: auto; color: #f8fafc; font: 13px/1.75 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
    .accent { color: hsl(var(--orange)); }
    .grid { display: grid; gap: 16px; grid-template-columns: repeat(3, 1fr); margin: 36px 0; }
    .feature, .section { padding: 24px; }
    .feature h3, .section h2 { margin: 0 0 10px; letter-spacing: -.035em; }
    .feature p, .section p { margin: 0; color: hsl(var(--muted)); line-height: 1.55; }
    .section { margin: 18px 0; }
    .flow { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-top: 20px; }
    .step { min-height: 88px; padding: 16px; border-radius: 16px; background: hsl(24 10% 13%); border: 1px solid hsl(var(--border)); }
    .step span { display: block; color: hsl(var(--orange)); font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; margin-bottom: 8px; }
    .command { display: flex; align-items: stretch; gap: 8px; border-radius: 14px; background: rgba(0,0,0,.34); border: 1px solid hsl(var(--border)); overflow: hidden; margin-top: 12px; }
    .code { flex: 1; min-width: 0; padding: 14px 16px; color: #fed7aa; font: 13px/1.6 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; overflow: auto; }
    .copy { border: 0; border-left: 1px solid hsl(var(--border)); padding: 0 14px; background: rgba(255,255,255,.04); color: hsl(var(--muted)); font-weight: 700; cursor: pointer; }
    .copy:hover { color: hsl(var(--fg)); background: rgba(255,255,255,.07); }
    footer { padding: 42px 0 60px; color: hsl(var(--muted)); font-size: 14px; }
    @media (max-width: 860px) { .hero, .grid, .flow { grid-template-columns: 1fr; } .navlinks { display: none; } .hero { padding-top: 36px; } }
  </style>
</head>
<body>
  <main class="container">
    <nav class="nav">
      <a class="brand" href="/"><span class="logo">↯</span><span>AgentPay Router</span></a>
      <div class="navlinks"><a href="#flow">Flow</a><a href="#try">Try</a><a href="https://github.com/baseddesigner/agentpay-router">GitHub</a></div>
    </nav>

    <section class="hero">
      <div>
        <span class="eyebrow">x402-style payments · Base quotes · KeeperHub handoffs</span>
        <h1>Paid API rails for agents.</h1>
        <p class="lead">Pay per request. Get live Base quotes. Send policy-checked handoffs.</p>
        <div class="actions"><a class="button primary" href="#try">Try API</a><a class="button" href="https://github.com/baseddesigner/agentpay-router">View repo</a></div>
      </div>
      <div class="card terminal" aria-label="terminal demo">
        <div class="terminalbar"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
        <pre><span class="accent">$</span> curl -i /quote?sell=USDC&buy=CBBTC&amount=100
HTTP/2 402 Payment Required

<span class="accent">$</span> curl -H 'x-payment: demo-paid' /quote?sell=USDC&buy=CBBTC&amount=100
{ "payment": { "status": "settled" }, "quote": { "buy": "CBBTC" } }</pre>
      </div>
    </section>

    <section class="grid">
      <article class="card feature"><h3>402 first</h3><p>Unpaid calls get a machine-readable payment challenge.</p></article>
      <article class="card feature"><h3>Live quotes</h3><p>USDC → cbBTC on Base, using the real cbBTC contract.</p></article>
      <article class="card feature"><h3>Safe handoff</h3><p>Paid quotes become policy-checked KeeperHub payloads.</p></article>
    </section>

    <section id="flow" class="card section">
      <h2>One paid quote. One handoff.</h2>
      <p>cbBTC: <code>0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf</code></p>
      <div class="flow">
        <div class="step"><span>01</span>Request quote</div>
        <div class="step"><span>02</span>Receive 402</div>
        <div class="step"><span>03</span>Pay request</div>
        <div class="step"><span>04</span>Get quote</div>
        <div class="step"><span>05</span>Prepare handoff</div>
      </div>
    </section>

    <section id="try" class="card section">
      <h2>Try it.</h2>
      <p>Live API: <code>${apiBase}</code></p>
      <div class="command"><div class="code">curl ${apiBase}/health</div><button class="copy" data-copy="curl ${apiBase}/health">Copy</button></div>
      <div class="command"><div class="code">curl -i '${apiBase}/quote?sell=USDC&amp;buy=CBBTC&amp;amount=100'</div><button class="copy" data-copy="curl -i '${apiBase}/quote?sell=USDC&buy=CBBTC&amount=100'">Copy</button></div>
      <div class="command"><div class="code">curl -H 'x-payment: demo-paid' '${apiBase}/quote?sell=USDC&amp;buy=CBBTC&amp;amount=100'</div><button class="copy" data-copy="curl -H 'x-payment: demo-paid' '${apiBase}/quote?sell=USDC&buy=CBBTC&amount=100'">Copy</button></div>
      <div class="command"><div class="code">POST /keeperhub/prepare-execution</div><button class="copy" data-copy='QUOTE=$(curl -s -H "x-payment: demo-paid" "${apiBase}/quote?sell=USDC&buy=CBBTC&amount=100"); curl -X POST ${apiBase}/keeperhub/prepare-execution -H "content-type: application/json" -d "{\"wallet\":\"0x0000000000000000000000000000000000000000\",\"quote\":$QUOTE,\"policy\":{\"maxUsd\":5000,\"maxSlippageBps\":100}}"'>Copy</button></div>
    </section>
  </main>
  <footer class="container">AgentPay Router · paid HTTP for autonomous software.</footer>
  <script>
    async function copyText(text) {
      if (navigator.clipboard && window.isSecureContext) {
        try { await navigator.clipboard.writeText(text); return; } catch (_error) {}
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
        try { await copyText(button.dataset.copy || ''); button.textContent = 'Copied'; }
        catch (_error) { button.textContent = 'Copy failed'; }
        setTimeout(() => { button.textContent = label; }, 1200);
      });
    }
  </script>
</body>
</html>`;
}
