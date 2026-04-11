<div align='center'>

<img src="src/assets/logo-light.svg" width="128" height="128" />

<h1>Fancy Hacker News</h1>

<p><strong>A fancy redesign of Hacker News with theme support.</strong></p>

</div>

A Chrome and Firefox extension that fully parses and re-renders Hacker News pages with Vue 3.

There is no SPA routing, and the redesigned UI keeps Hacker News behavior native: links and forms still point at HN, voting and flagging use HN's own endpoints, and search opens Algolia in a new tab.

## Commands

Build:

- `pnpm build` — production build for the content script, anti-FOUC bootstrap, and background script.
- `pnpm build:firefox` — Firefox-targeted production build.
- `pnpm build:chromium` — Chromium-targeted production build.

Package:

- `pnpm package:firefox` — build and create a clean AMO-ready ZIP in `web-ext-artifacts/`.
- `pnpm package:chrome` — build and create a clean Chrome Web Store-ready ZIP in `web-ext-artifacts/`.

Develop and verify:

- `pnpm dev` — watch mode for the content script.
- `pnpm typecheck` — run `vue-tsc --noEmit`.
- `pnpm test` — run Vitest once.
- `pnpm test:watch` — run Vitest in watch mode.

Design concepts playground:

- `pnpm concepts:dev` — run the concepts dev server.
- `pnpm concepts:build` — build the concepts playground.
- `pnpm concepts:preview` — preview the built concepts playground.

## Build Output

Production builds write extension assets to `dist/`. Package commands write browser-store ZIPs to `web-ext-artifacts/`.

## Testing

Tests run with Vitest and jsdom:

- `pnpm test` — run the full test suite once.
- `pnpm test:watch` — run the suite in watch mode.

HTML snapshots of real Hacker News pages live in `test/fixtures/`. Parser coverage should use fixtures instead of live network requests.

## Browser Support

| Browser | Minimum version |
|---------|----------------|
| Firefox | 140 (142 for Android) |
| Chrome / Chromium | 114 |
