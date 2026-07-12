export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      :root { --bg: #0F172A; --text: #F8FAFC; --text-2: #94A3B8; --surface: #1E293B; --line: rgba(148,163,184,0.14); --accent: #F59E0B; --on-accent: #0F172A; }
      body { font: 15px/1.5 "Inter", system-ui, -apple-system, sans-serif; background: var(--bg); color: var(--text); display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: var(--text-2); margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 9999px; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; font-size: 13px; }
      .primary { background: var(--accent); color: var(--on-accent); font-weight: 600; }
      .secondary { background: var(--surface); color: var(--text); border-color: var(--line); }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>This page didn't load</h1>
      <p>Something went wrong on our end. You can try refreshing or head back home.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </div>
  </body>
</html>`;
}
