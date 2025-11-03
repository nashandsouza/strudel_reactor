export function injectDarkTheme() {
    if (document.querySelector('style[data-theme="dark-injected"]')) return;
    const DARK_CSS = `
    :root { --bg:#0b0f17; --card:#121a2b; --ink:#e8eef9; --ink-dim:#9cb0d2; --line:#20304b; --accent:#66a3ff; --success:#38d18e; --danger:#ff6b6b; }
    html,body,#root{height:100%}
    body{background:radial-gradient(1200px 600px at 10% -10%, #10182b 0%, #0b0f17 50%) fixed;color:var(--ink)}
    .app-shell{min-height:100svh;display:grid;grid-template-rows:auto 1fr auto}
    header.appbar{background:linear-gradient(180deg,rgba(18,26,43,.6),rgba(18,26,43,.2));backdrop-filter:blur(8px);border-bottom:1px solid var(--line)}
    .card{background:linear-gradient(180deg,rgba(18,26,43,.9),rgba(12,18,32,.9));border:1px solid var(--line);border-radius:16px;box-shadow:0 8px 24px rgba(0,0,0,.35)}
    .form-control,.form-select{background:#0d1324;border-color:#223252;color:var(--ink)}
    .form-control:focus,.form-select:focus{border-color:var(--accent);box-shadow:0 0 0 .2rem rgba(102,163,255,.15)}
    .btn-accent{background:var(--accent);border-color:var(--accent);color:#031326}
    .btn-ghost{background:transparent;border:1px solid var(--line);color:var(--ink)}
    .btn-ghost:hover{background:#0f1522}
    .badge-dot{display:inline-flex;align-items:center;gap:.45rem;color:var(--ink-dim)}
    .badge-dot::before{content:"";width:.6rem;height:.6rem;border-radius:50%;background:currentColor;box-shadow:0 0 14px currentColor}
    .play-led{width:.6rem;height:.6rem;border-radius:50%;display:inline-block;margin-right:.4rem;background:var(--danger);box-shadow:0 0 10px rgba(255,107,107,.5)}
    .playing .play-led{background:var(--success);box-shadow:0 0 12px rgba(56,209,142,.7)}
    footer{color:var(--ink-dim);border-top:1px solid var(--line)}
    textarea.code{font-family: ui-monospace, Menlo, Consolas, "Courier New", monospace;min-height:220px}
    ::-webkit-scrollbar{height:12px;width:12px}
    ::-webkit-scrollbar-thumb{background:#1c2a44;border-radius:999px;border:3px solid var(--bg)}
    `;
    const styleTag = document.createElement('style');
    styleTag.setAttribute('data-theme', 'dark-injected');
    styleTag.textContent = DARK_CSS;
    document.head.appendChild(styleTag);
    }