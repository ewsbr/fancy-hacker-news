<div align='center'>

<img src="src/assets/logo-dark.svg" width="128" height="128" alt="Fancy Hacker News Logo" />

<h1>Fancy Hacker News</h1>

<p><strong>A fancy redesign of Hacker News with theme support.</strong></p>

</div>

A Chrome and Firefox extension that fully parses and re-renders Hacker News pages with Vue 3.

There is no SPA routing, and the redesigned UI keeps Hacker News behavior native: links and forms still point at HN, voting and flagging use HN's own endpoints, and search opens Algolia in a new tab.

![Redesigned frontpage](./images/image.png)

## Goals
> Hacker News, but like it was designed after 2020.

The objective is to provide a more pleasant Hacker News experience with many QoL improvements and full feature parity. **If you know of a feature that doesn't work with the extension, please open an issue.**

Some features, like downvote levels, upvoting and flagging are not available via API, so we just pay the price of parsing HTML from the actual page.

> Why not customize via CSS?

CSS-only customization is very limited. We cannot rearrange elements, add fancy features (like the downvote level counters) or fix some structural issues, such as the left spacing on code blocks.

**Non-goals**:
- SPA routing. Yes, we will re-render the page on every navigation.
- Custom backend or proxying.

## Commands

Build:

- `pnpm build` — production build for the shared Firefox/Chromium content script, anti-FOUC bootstrap, and background script.

Package:

- `pnpm package` — build once and create both the AMO-ready Firefox ZIP and the Chrome Web Store-ready ZIP in `web-ext-artifacts/`.

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

Tests run with Vitest in two lanes:

- `node` is the default environment for route resolution, parsers, and pure content logic.
- `jsdom` is opt-in for Vue SFC tests and specs that need browser globals like `document`, `window`, or `KeyboardEvent`. Use `// @vitest-environment jsdom` at the top of those files.

HTML snapshots of real Hacker News pages live in `test/fixtures/`. Fixture and parser tests should load documents through the shared helpers in `test/helpers/` instead of creating global browser state for the whole suite.

- `pnpm test` — run the full test suite once.
- `pnpm test:watch` — run the suite in watch mode.


## Browser Support

| Browser | Minimum version |
|---------|----------------|
| Firefox | 140 (142 for Android) |
| Chrome / Chromium | 114 |
