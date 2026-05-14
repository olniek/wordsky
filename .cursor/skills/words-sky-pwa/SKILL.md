---
name: words-sky-pwa
description: >-
  Progressive Web App setup for Words Sky (vite-plugin-pwa, manifest,
  Workbox precache, service worker registration, install/update UX). Use when
  changing vite.config.ts PWA options, offline behavior, cache strategy, web
  manifest, icons, or SW registration.
disable-model-invocation: true
---

# Words Sky — PWA skill

## Steps

1. **Locate the change** — [`vite.config.ts`](vite.config.ts) `VitePWA` options, [`src/app/main.tsx`](src/app/main.tsx) (`registerPwaServiceWorker` from [`src/lib/pwaRegister.ts`](src/lib/pwaRegister.ts)), manifest/icons, Workbox `globPatterns` / `navigateFallback`, or [`src/vite-env.d.ts`](src/vite-env.d.ts) / [`tsconfig.app.json`](tsconfig.app.json) types — then read the matching subsection below.
2. **Edit safely** — keep **one** registration path (`injectRegister: false` + `registerPwaServiceWorker()` in [`src/app/main.tsx`](src/app/main.tsx)); never add a second `<link rel="manifest">` in `index.html`; do not hand-write `public/sw.js` (Workbox emits into `dist/`).
3. **Verify** — `npm run build` then `npm run preview`; confirm offline shell and SPA fallback where expected; confirm **`wordssky.progress.v2`** (and related keys) still behave if origin or HTTPS assumptions change.
4. **Optional** — Lighthouse PWA if manifest, icons, or SW strategy changed materially.

## Where config lives

- **[`vite.config.ts`](vite.config.ts)** — `VitePWA({ ... })`: `registerType`, `injectRegister`, `includeAssets`, `manifest`, `workbox`, `devOptions`.
- **[`src/app/main.tsx`](src/app/main.tsx)** — calls `registerPwaServiceWorker()` from [`src/lib/pwaRegister.ts`](src/lib/pwaRegister.ts) (single registration path; **`injectRegister: false`** in the plugin so nothing is auto-injected into `index.html`).
- **`index.html`** — do **not** add a second `<link rel="manifest">`; the plugin injects manifest + meta on build.
- **No hand-written `public/sw.js` or `public/manifest.webmanifest`** — Workbox emits the service worker and manifest into **`dist/`** at build time.

## Current behavior (verify after edits)

- **`registerType: 'autoUpdate'`** — new builds activate when the user focuses the app; there is no custom “update available” UI yet.
- **`injectRegister: false`** + **`registerPwaServiceWorker()`** in **`src/app/main.tsx`** — explicit client registration only (no duplicate inject).
- **`devOptions.enabled: false`** — no service worker in dev (avoids stale HMR caches). Test SW behavior with **`npm run build`** then **`npm run preview`**.
- **`workbox.globPatterns`** — precaches emitted static assets (`js`, `css`, `html`, `svg`, etc.); **`navigateFallback: '/index.html'`** — SPA routes work offline after assets have been cached at least once online.
- **`includeAssets`** — extra files in precache scope (e.g. `favicon.svg`, `icons.svg`).

## Manifest

- Manifest fields live in **`vite.config.ts`** under `manifest: { ... }`. Keep **`name`**, **`short_name`**, **`description`**, **`theme_color`**, **`background_color`**, **`display`**, **`start_url`**, **`scope`**, **`icons`** aligned with [UX.md](UX.md) tone (A1, short sessions) and actual app branding.
- Icon **`purpose`** / sizes: invalid combinations (e.g. **`maskable`** on SVG-only icons) can fail Lighthouse or install prompts. Today the SVG icon uses **`purpose: 'any'`** only.
- **PNG icons (192 / 512) and a dedicated `apple-touch-icon` PNG** improve install prompts and iOS home-screen icons; add assets under **`public/`** and extend the `manifest.icons` array when you want that polish.

## TypeScript

- **[`src/vite-env.d.ts`](src/vite-env.d.ts)** references **`vite-plugin-pwa/client`** so `virtual:pwa-register` type-checks. **`tsconfig.app.json`** includes **`vite-plugin-pwa/client`** in **`compilerOptions.types`**.

## Do not

- Enable **`devOptions.enabled: true`** without a team convention (confuses local dev).
- Precache unbounded dynamic URLs or API responses without an explicit strategy.
- Register the service worker twice (plugin inject **and** manual `navigator.serviceWorker.register`).

## Product tie-in

- PWA must not contradict [UX.md](UX.md): no accounts, no surprise permission walls; clarity first.
