# Fancy HackerNews — Agent Guide

Fancy HackerNews is a Manifest V3 browser extension for Chrome and Firefox that fully re-renders Hacker News pages with a Vue 3 app mounted into the live document body. Initial data always comes from the original HN DOM before the page is hidden. Interactive behavior stays native to Hacker News: links and forms keep pointing at HN, vote and flag actions use HN endpoints, and search opens Algolia in a new tab.

There is still no SPA routing and no custom backend.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | Vue 3, Composition API, `<script setup lang="ts">` |
| Language | TypeScript, strict mode |
| Styling | Raw SCSS with global tokens/reset + scoped component styles |
| Build | Vite 8, separate content/background/anti-FOUC targets |
| Testing | Vitest with fixture-based parser and content tests |
| Package manager | pnpm |
| Icons | `lucide-vue-next` |
| UI primitives | `reka-ui` |

---

## Key Commands

```bash
pnpm dev               # build anti-FOUC script, then watch content script
pnpm build             # build content, anti-FOUC, and background targets
pnpm build:firefox     # Firefox-flavoured production build
pnpm build:chromium    # Chromium-flavoured production build
pnpm typecheck         # vue-tsc --noEmit
pnpm test              # run Vitest once
pnpm package:firefox   # package Firefox zip
pnpm package:chrome    # package Chrome zip
pnpm concepts:dev      # run the design concepts playground
```

Use Conventional Commits when making git commits.

---

## Primary Docs

- `README.md` — contributor overview and local build/load instructions
- `EXTENSION.md` — browser-facing feature summary and extension behavior
- `DESIGNSYSTEM.md` — shared UI contract for breakpoints, spacing, typography, pagination, and tap targets

Update `DESIGNSYSTEM.md` whenever you materially change shared responsive behavior, attached pagination treatment, badge sizing, or tap-target conventions.

---

## Runtime Flow

`src/content/main.ts` is the main entrypoint at `document_end`.

1. Parse the original HN DOM with `parseHeader(document)` plus the page-specific parser chosen from `resolveRoute(location)`.
2. Detect HN special cases such as the literal `Unknown.` body and map them to the dedicated `notfound` route.
3. For item pages, pass parsed data through `makeItemPageReactive()` to avoid excessive deep reactivity work on large comment trees.
4. Hide the original HN body, remove source assets that would interfere, create `#fancy-hn-root`, and apply any bootstrapped theme state.
5. Mount the Vue app, provide parsed data and layout metadata, then render the page shell and route-specific page component.
6. After first paint, strip the original HN DOM. If anything throws earlier, the original HN page must remain visible.

`src/content/anti-fouc.ts` runs at `document_start` to reduce flash-of-unstyled-content before the main content script mounts.

---

## Important Files

This is the shortest useful map of the codebase. Start here before drilling into subfolders.

```text
src/
  content/main.ts                     # parse -> hide -> mount -> cleanup
  content/anti-fouc.ts                # document_start anti-FOUC bootstrap
  content/App.vue                     # route -> page selection
  content/components/layout/AppShell.vue  # shared shell + search modal
  content/composables/use-hn-actions.ts   # vote / flag against HN endpoints
  content/pages/                      # page-level route components
  parsers/                            # original DOM -> typed page models
  router/index.ts                     # resolveRoute(location)
  state/item-page-state.ts            # large item/comment performance helpers
  styles/main.scss                    # global styling entrypoint
  styles/_theme-tokens.scss           # theme variables
  background/background.js            # MV3 service worker

manifest.json                         # extension entrypoints and injected assets
vite.config.ts                        # Vite targets, IIFE output, asset URL handling
test/fixtures/                        # real HN HTML snapshots for parser work
test/                                 # Vitest coverage for parsers and content behavior
```

---

## Where To Start

- Parser bug or missing data: work in the matching file under `src/parsers/`, add or update a fixture under `test/fixtures/`, and cover it in `test/parsers/` or the relevant content test.
- Rendering or UX bug: start in `src/content/pages/` for page-level issues, then `src/content/components/` for shared UI.
- Vote, flag, or other native action issues: inspect `src/content/composables/use-hn-actions.ts` first.
- Search, chrome, or keyboard shortcut changes: inspect `src/content/components/layout/AppShell.vue` and related layout components.
- Theme or spacing regressions: inspect `src/styles/main.scss`, `src/styles/_theme-tokens.scss`, and `DESIGNSYSTEM.md`.
- Build or asset loading issues: inspect `vite.config.ts` and `manifest.json`.

---

## Architecture Rules

- Parse first. All page data must be derived from the original server-rendered HN DOM before the app hides it.
- No SPA navigation. `resolveRoute(location)` is a pure read of the current URL on page load.
- No custom backend. Do not introduce client-side fetching for core page data.
- Keep HN behavior native. Links and forms should continue targeting HN; vote and flag actions should continue using HN URLs/endpoints.
- Preserve auth and CSRF data exactly. `auth=` params and hidden fields like `hmac` must be taken from the DOM, never fabricated.
- Keep rendering isolated to `#fancy-hn-root`; do not leak styling back into the underlying HN page.
- SCSS is the styling system. Shared tokens live in `src/styles/`; component/page styling stays in scoped `lang="scss"` blocks.
- Content CSS ships as a real stylesheet injected by `manifest.json`.
- JS-hosted assets must resolve through `chrome.runtime.getURL(...)` as configured in `vite.config.ts`.
- Re-injection is guarded. If `#fancy-hn-root` already exists on reinjection, reload the page to restore the original DOM before reparsing.
- Respect source quirks. If HN emits inconsistent or odd behavior, document it before changing parser or UI behavior.
- Use fixtures, not live network requests, when adding parser coverage.

### CSS Unit Rules

- Use `rem` for typography only: `font-size`, and text-driven line-height where scaling with user text size is intentional.
- Use `px` for layout and chrome: `padding`, `margin`, `gap`, fixed grid columns, `width`, `height`, `min/max-*`, icon/button dimensions, modal offsets, and negative margins.
- Do not use root-`rem` spacing for component scaffolding. Users can increase root font size for accessibility, and layout spacing must remain stable when they do.
- If a local control should grow a bit with larger text, prefer bounded `clamp(...)` or `em` tied to the component's own font size, not unbounded root-`rem` spacing.
- Keep content container widths in `px`; do not let global max-widths expand with root font size.

---

## Responsive Rules

- `640px` is the primary mobile breakpoint.
- `768px` is the primary medium/sidebar breakpoint.
- Treat older values like `980`, `720`, `480`, and `380` as legacy or layout-specific, not new defaults.
- When adding responsive behavior, first check whether `640px` or `768px` already expresses it cleanly.

---

## Themes

Theme state is applied through `data-theme` on `#fancy-hn-root`.

- `light`
- `dark`
- `nord`
- `amoled`

Theme tokens live in `src/styles/_theme-tokens.scss` and are consumed by `src/styles/main.scss`.

---

## Parsers

Parsers are pure functions of the form `(doc: Document) => typed model`.

Main parser groups:

- `header.ts` for shared top-bar/header metadata
- `story-list.ts` for story list routes such as `/news`, `/ask`, `/show`, `/jobs`, `/submitted`, and `/hidden`
- `item.ts` for `/item?id=...`
- `user.ts`, `threads.ts`, `new-comments.ts`, `submit.ts`, `reply.ts`, and `login.ts` for their corresponding route families
- `static.ts` for static or fallback content pages
- `leaders.ts`, `lists.ts`, `top-colors.ts`, and `delete-confirm.ts` for special HN utility pages

When parser behavior changes, update the relevant fixture-backed tests.

---

## Files To Ignore

- `dist/` — build output, not committed
- `web-ext-artifacts/` — packaged browser artifacts
