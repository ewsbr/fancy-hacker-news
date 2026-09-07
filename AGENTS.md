# Fancy HackerNews — Agent Guide

Fancy Hacker News is a Manifest V3 browser extension for Chrome and Firefox that re-renders Hacker News pages with a Vue 3 app mounted into the live document body. Page data comes from the original HN DOM, including retained rows for deferred comment parsing. Links and forms keep pointing at HN, vote and flag actions use HN endpoints, and the search dialog opens Algolia results in a new tab.

There is still no SPA routing and no custom backend.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | Vue 3, Composition API, `<script setup lang="ts">` |
| Language | TypeScript, strict mode |
| Styling | Raw SCSS with global tokens/reset + scoped component styles |
| Build | Vite, separate content, anti-FOUC, settings, and background targets |
| Testing | Vitest with fixture-based parser and content tests |
| Package manager | pnpm |
| Icons | `lucide-vue-next` |
| UI primitives | `reka-ui` |

---

## Key Commands

```bash
pnpm dev               # build other targets once, then watch content script
pnpm build             # build all four targets for Firefox and Chromium
pnpm check             # lint, typecheck, test, and build
pnpm typecheck         # vue-tsc --noEmit
pnpm test              # run Vitest once
pnpm package           # run quality checks, build, and package both browser ZIPs
pnpm concepts:dev      # run the design concepts playground
```

Use Conventional Commits when making git commits.

---

## Primary Docs

- [README.md](README.md) — contributor overview and local build/load instructions
- [EXTENSION.md](EXTENSION.md) — shared release description for AMO and Chrome; keep the store-specific copies in `marketplaces/` consistent with it
- [DESIGNSYSTEM.md](DESIGNSYSTEM.md) — shared UI conventions
- [test/fixtures/README.md](test/fixtures/README.md) — fixture categories and naming

Update `DESIGNSYSTEM.md` whenever you materially change shared responsive behavior, attached pagination treatment, badge sizing, or tap-target conventions.

---

## Runtime Flow

`src/content/main.ts` is the main entrypoint at `document_end`.

1. Start loading extension settings, ensure a responsive viewport, and capture the mobile layout flag once. Parse the header and resolve the URL with `resolveRoute(location)`.
2. Detect HN special cases such as the literal `Unknown.` body and map them to the dedicated `notfound` route.
3. Use `src/content/route-page.ts` to select the parser and page component. For item pages, prepare the initial fragment target and call `makeItemPageReactive()` to keep comment trees out of deep reactivity.
4. Prime extension fonts, hide the original HN content, remove interfering source assets, create `#fancy-hn-root`, and apply settings and the HN top-bar color.
5. Mount the Vue app, provide parsed data and layout metadata, then render the page shell and route-specific page component.
6. After two animation frames, schedule source-body cleanup and detach retained deferred comment rows from their old parents. Mount failures remove the partial host and hiding styles to reveal the source body.

`src/content/anti-fouc.ts` runs at `document_start` to reduce flash-of-unstyled-content before the main content script mounts.

---

## Important Files

This is the shortest useful map of the codebase. Start here before drilling into subfolders.

```text
src/
  content/main.ts                     # parse -> hide -> mount -> cleanup
  content/anti-fouc.ts                # document_start anti-FOUC bootstrap
  content/route-page.ts               # route -> parser, typed data, page component
  content/App.vue                     # render the selected page inside the shell
  content/components/layout/AppShell.vue  # shared shell + search modal
  content/composables/use-hn-actions.ts   # vote / flag against HN endpoints
  content/pages/                      # page-level route components
  parsers/                            # original DOM -> typed page models
  router/index.ts                     # resolveRoute(location)
  state/item-page-state.ts            # large item/comment performance helpers
  state/settings.ts                  # validated settings, migration, local storage
  state/settings-context.ts          # reactive settings and persistence
  settings/                          # standalone extension options page
  background/main.ts                 # open options page via validated messages
  styles/main.scss                    # global styling entrypoint
  styles/_theme-tokens.scss           # theme variables

manifest.json                         # extension entrypoints and injected assets
vite.config.ts                        # Vite targets, IIFE output, asset URL handling
scripts/package-extension.mjs         # browser-specific manifests and ZIP staging
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
- Settings issues: inspect `src/state/settings.ts`, `src/state/settings-context.ts`, and `src/settings/`.

---

## Architecture Rules

- Capture source data first. Parse the original server-rendered HN DOM before takeover; deferred threads may retain source rows for later parsing. Do not detach those rows before successful source-body cleanup, because failure recovery still needs the source page.
- No SPA navigation. `resolveRoute(location)` is a pure read of the current URL on page load.
- No custom backend. Do not introduce client-side fetching for core page data.
- Keep HN behavior native. Links and forms should continue targeting HN; vote and flag actions should continue using HN URLs/endpoints.
- Preserve auth and CSRF data exactly. `auth=` params and hidden fields like `hmac` must be taken from the DOM, never fabricated.
- Keep rendering isolated to `#fancy-hn-root`; do not leak styling back into the underlying HN page.
- Target content-script portals at `#fancy-hn-root` through `src/content/utils/root-host.ts` so they inherit theme tokens and survive source-body cleanup.
- SCSS is the styling system. Shared tokens live in `src/styles/`; component/page styling stays in scoped `lang="scss"` blocks.
- Prefer existing theme tokens from `src/styles/_theme-tokens.scss` over local `color-mix()` usage. Use `color-mix()` only when a value genuinely needs runtime blending, not as the default way to derive nearby colors.
- Use `reka-ui` for interactive UI primitives such as dropdowns, popovers, menus, dialogs, tooltips, and similar focus-managed controls. Do not hand-roll primitive behavior when a suitable `reka-ui` primitive exists.
- Portaled `reka-ui` content does not inherit scoped SFC selectors on the portal root. Follow the existing shell/surface pattern: give the Reka content a lightweight shell class for positioning/z-index, then render a styled inner surface element inside it so scoped styles still apply.
- Content CSS ships as a real stylesheet injected by `manifest.json`.
- JS-hosted content-script assets must resolve through `chrome.runtime.getURL(...)` as configured in `vite.config.ts`. Settings-page assets use extension-relative URLs.
- Keep settings validation, defaults, and migration in `src/state/settings.ts`. Persist preferences in `chrome.storage.local`; do not introduce HN-origin storage for extension settings.
- Re-injection is guarded. If `#fancy-hn-root` already exists on reinjection, reload the page to restore the original DOM before reparsing.
- Respect source quirks. If HN emits inconsistent or odd behavior, document it before changing parser or UI behavior.
- Use fixtures, not live network requests, when adding parser coverage.
- For new feature-local composable modules, prefer descriptive filenames like `comment-node.ts` over `use-foo.ts`, and keep multiple related composables in the same file when they serve one feature boundary. Older `use-*.ts` files can stay in place until they need substantive work.

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

Parsers read a supplied `Document` and return typed models; some accept explicit options. Keep them independent of browser globals and network access. Deferred item threads retain DOM rows until loaded; parsing must not mutate the source document.

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
