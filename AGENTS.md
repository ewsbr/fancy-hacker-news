# HackerNews Modern UI — Agent Guide

A browser extension (Manifest V3, Chrome + Firefox) that fully re-renders every HackerNews page using a Vue 3 app mounted inside a shadow DOM. All data comes from parsing the original HN page DOM — no API calls, no SPA routing.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI framework | Vue 3 (Composition API, `<script setup lang="ts">`) |
| Language | TypeScript (strict mode, `vue-tsc` for type checking) |
| Styling | Tailwind CSS v4 (CSS-first, `@theme` directive, shadow DOM) |
| Build | Vite 8 IIFE build, separate content + background targets |
| Package manager | pnpm |
| Icons | `lucide-vue-next` |
| Fonts | Atkinson Hyperlegible Next, Inter, JetBrains Mono (bundled WOFF2) |

---

## Key Commands

```bash
pnpm build          # build content + background scripts
pnpm dev            # watch mode (content script only)
pnpm typecheck      # vue-tsc --noEmit (type check all .ts/.vue files)
```

---

## How It Works (Entry Point Flow)

`src/content/main.ts` runs at `document_end` as the content script:

1. **Parse** — call `parseHeader(document)` + `resolveRoute(location)` against the live HN DOM
2. **Hide** — `display: none` all original body children
3. **Shadow DOM** — create `div#hn-modern-root`, attach a shadow root, inject `main.css` and a mount point
4. **Mount** — `createApp(App)`, provide `header`, `route`, `originalDoc`, `renderTime` via `app.provide()`
5. **Render** — Vue renders the modern UI entirely inside the shadow root

If anything throws, the original HN page is left visible (graceful fallback).

---

## Source Layout

```
src/
├── content/
│   ├── main.ts              # entry point (parse → hide → shadow → mount)
│   ├── App.vue              # root: injects route, picks page component
│   ├── layout/
│   │   ├── AppShell.vue     # header + <slot> + footer wrapper
│   │   ├── SiteHeader.vue   # logo, nav links, user controls, ThemeToggle
│   │   └── SiteFooter.vue   # yclinks, Algolia search link
│   ├── pages/
│   │   ├── StoriesPage.vue  # /news, /newest, /ask, /show, /jobs, etc.
│   │   ├── CommentsPage.vue # /item?id=...
│   │   ├── LoginPage.vue    # /login, /changepw, /forgot
│   │   └── StaticPage.vue   # /newsfaq, /newsguidelines, catch-all
│   └── shared/
│       └── ThemeToggle.vue  # cycles light/dark/nord/amoled
├── parsers/
│   ├── utils.ts             # textOf, attrOf, hrefOf, parseScore, parseAge, …
│   ├── header.ts            # parseHeader(doc) → ParsedHeader
│   └── (storyList|item|user|threads|newComments|submit|reply).ts  # in progress
├── router/
│   └── index.ts             # resolveRoute(location) → RouteDescriptor (pure fn)
├── state/
│   └── theme.ts             # useTheme() composable — chrome.storage + data-theme
├── styles/
│   └── main.css             # @import tailwindcss, @theme tokens, @font-face, theme vars
├── assets/
│   └── fonts/               # bundled WOFF2 files
├── background/
│   └── background.js        # service worker scaffold (MV3)
└── env.d.ts                 # vite/client + chrome types
```

---

## Architecture Rules

- **No fetch / no API** — all data is parsed from the original HN DOM before Vue mounts.
- **No SPA navigation** — `resolveRoute` is a pure read of `location` on page load only. All links and forms are native HTML pointing at HN's own servers.
- **CSRF tokens preserved** — `auth=` params in links and `hmac` hidden fields are taken verbatim from the parsed DOM — never hardcoded or fabricated.
- **Shadow DOM isolation** — all Vue output and CSS lives inside the shadow root; it cannot affect HN's DOM and HN's styles cannot bleed in.
- **Parse-first** — parsers run synchronously against the original document before it is hidden. If a parser throws, the error is caught and the original page is shown.
- **`process.env.NODE_ENV` must be defined** — set via `define` in `vite.config.js` so Vue's IIFE bundle doesn't reference the Node.js global at runtime.

---

## Themes

Four themes toggled via `data-theme` attribute on `#hn-modern-root`: `light` (default), `dark`, `nord`, `amoled`. Defined as CSS custom properties on `:host` / `:host[data-theme="..."]` in `main.css`. Persisted via `chrome.storage.local`.

---

## Parsers (in progress)

Each parser is a pure function `(doc: Document) → TypedModel`. Implemented so far:

| File | Function | Status |
|------|----------|--------|
| `utils.ts` | shared helpers | ✅ done |
| `header.ts` | `parseHeader` | ✅ done |
| `storyList.ts` | `parseStoryList` | 🔲 planned |
| `item.ts` | `parseItemPage` | 🔲 planned |
| `newComments.ts` | `parseNewComments` | 🔲 planned |
| `user.ts` | `parseUserPage` | 🔲 planned |
| `threads.ts` | `parseThreadsPage` | 🔲 planned |
| `submit.ts` | `parseSubmitPage` | 🔲 planned |
| `reply.ts` | `parseReplyPage` | 🔲 planned |

Full parser specs (selectors, data models) are in [`plan/03-parsers.md`](plan/03-parsers.md).

---

## Test Fixtures

HTML snapshots of real HN pages live in `test/fixtures/`. Use these when building or testing parsers — do not make live network requests.

---

## Files to Ignore

- `cohesive.tsx` — unrelated React prototype, not part of the extension build.
- `dist/` — build output, not committed.
