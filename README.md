# Hej John. Tack Erik.

A personal Swedish greeting with an interactive Three.js code factory and 30-day shipping statistics supplied by William.

## Development

```sh
npm ci
npm run dev
```

## Check

With the dev server running and Google Chrome installed:

```sh
node scripts/check-browser.mjs
```

## Publish

```sh
npm run build
git add src index.html public vite.config.js package.json package-lock.json docs
git commit -m "Update greeting"
git push
```

GitHub Pages serves the committed `docs/` directory on `main`, matching the branch-based approach used by downstairs-bathroom. Relative asset paths support the project URL. No messages are sent by the fika button; it displays an invitation to continue on LinkedIn.

Stats come from the supplied 30-day overview, not a live GitHub integration. Buildings and code movement are illustrative.
