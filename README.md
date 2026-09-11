# Hej John.

An immediate, full-screen Swedish 3D greeting for John: a cinematic retrofuturist diorama, orbiting aircraft, and a single greeting sign. Live at https://pages.bernting.se/hello-john-p/.

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

GitHub Pages serves the committed `docs/` directory on `main`, matching the branch-based approach used by downstairs-bathroom. Relative asset paths support the project URL. The page contains only the scene and AR/pause controls.

Buildings and code movement are illustrative.

## AR and aircraft

The same two animated airplanes and greeting sign appear in the page and the exported AR model. On compatible Android devices, WebXR supports the animation; Scene Viewer is also offered as a native fallback. iPhone uses a pre-exported static USDZ in Quick Look. Desktop opens an interactive model preview with phone instructions. Actual AR room placement requires a compatible physical device and HTTPS.

After changing scene geometry or animation, run this with the dev server running **before** building:

```sh
node scripts/export-ar.mjs
npm run build
```

Commit `public/greeting.glb`, `public/greeting.usdz`, and `docs/` alongside source updates. The export check validates the GLB animation channels and USDZ archive signature. Browser checks cover the AR preview; they do not simulate physical room placement.

