# HackerNews Modern UI — Agent Guide

A browser extension (Manifest V3, Chrome + Firefox) that fully re-renders every HackerNews page using a Vue 3 app mounted directly into the document body. All data comes from parsing the original HN page DOM — no API calls, no SPA routing.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI framework | Vue 3 (Composition API, `<script setup lang="ts">`) |
| Language | TypeScript (strict mode, `vue-tsc` for type checking) |
| Styling | Raw SCSS with a global theme/reset layer plus scoped component styles (BEM naming) |
| Build | Vite 8 IIFE build, separate content + background targets |
| Package manager | pnpm |
| Icons | `lucide-vue-next` |
| Fonts | Atkinson Hyperlegible Next, Manrope, JetBrains Mono (Fontsource variable packages) |

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
3. **Root Element** — create `div#hn-modern-root` in the document body, inject compiled global + component CSS into the document head, and set its mount point
4. **Mount** — `createApp(App)`, provide `header`, `route`, `originalDoc`, `renderTime` via `app.provide()`
5. **Render** — Vue renders the modern UI entirely inside the `#hn-modern-root` element

If anything throws, the original HN page is left visible (graceful fallback).

---

## Source Layout

```
src/
├── content/
│   ├── main.ts              # entry point (parse → hide → mount)
│   ├── anti-fouc.js         # injected before parse to suppress FOUC
│   ├── App.vue              # root: injects route, picks page component
│   ├── layout/
│   │   ├── AppShell.vue     # header + <slot> + footer wrapper
│   │   ├── SiteHeader.vue   # logo, nav links, user controls, ThemeToggle
│   │   └── SiteFooter.vue   # yclinks, Algolia search link
│   ├── pages/
│   │   ├── StoriesPage.vue  # /news, /newest, /ask, /show, /jobs, etc.
│   │   ├── ItemPage.vue     # /item?id=… — story detail + comment tree
│   │   ├── LoginPage.vue    # /login, /changepw, /forgot, /comment
│   │   └── StaticPage.vue   # /newsfaq, /newsguidelines, catch-all
│   ├── stories/
│   │   ├── StoryRow.vue     # single story: rank + vote + title + meta + badges
│   │   ├── StoryRank.vue    # rank number display
│   │   ├── StoryMeta.vue    # score, author, age, comments, hide/fav links
│   │   └── StoryDetail.vue  # full story header for item page
│   ├── comments/
│   │   ├── CommentTree.vue  # top-level comment list renderer
│   │   ├── CommentNode.vue  # recursive node with collapse/expand
│   │   ├── CommentHeader.vue # author, age, badges, nav links, toggle
│   │   ├── CommentBody.vue  # comment HTML with gray-level styling
│   │   └── CommentForm.vue  # reply form with hidden CSRF fields
│   └── shared/
│       ├── Badge.vue        # status badges: new, dead, flagged, downvoted, job
│       ├── Pagination.vue   # "More" pagination link
│       ├── RichText.vue     # HTML renderer with code/quote/link styles
│       ├── ThemeToggle.vue  # theme swatches
│       └── VoteButton.vue   # upvote chevron button
├── parsers/
│   ├── utils.ts             # textOf, attrOf, hrefOf, parseScore, parseAge, …
│   ├── header.ts            # parseHeader(doc) → ParsedHeader
│   ├── storyList.ts         # parseStoryList(doc) → ParsedStoryList
│   ├── item.ts              # parseItemPage(doc) → ParsedItemPage
│   ├── login.ts             # parseLoginPage(doc) → ParsedLoginPage
│   ├── static.ts            # parseStaticPage(doc) → ParsedStaticPage
│   └── (user|threads|newComments|submit|reply).ts  # planned
├── router/
│   └── index.ts             # resolveRoute(location) → RouteDescriptor (pure fn)
├── state/
│   └── theme.ts             # useTheme() composable — chrome.storage + data-theme
├── styles/
│   └── main.scss            # font imports, theme vars, global reset
├── background/
│   └── background.js        # service worker scaffold (MV3)
└── env.d.ts                 # vite/client + chrome types
```

---

## Architecture Rules

- **No fetch / no API** — all data is parsed from the original HN DOM before Vue mounts.
- **No SPA navigation** — `resolveRoute` is a pure read of `location` on page load only. All links and forms are native HTML pointing at HN's own servers.
- **CSRF tokens preserved** — `auth=` params in links and `hmac` hidden fields are taken verbatim from the parsed DOM — never hardcoded or fabricated.
- **CSS isolation** — all Vue output and CSS lives inside the `#hn-modern-root` container; it avoids affecting original HN elements through component scoping and careful selector choice (no shadow DOM used).
- **Styles are SCSS, not Tailwind** — global tokens/reset live in `src/styles/main.scss`; component and page styles live in scoped `lang="scss"` blocks using BEM class names.
- **Component CSS is inlined into `content.js`** — the custom Vite plugin exposes `virtual:component-styles`, then patches the emitted content bundle so scoped component CSS is injected alongside `main.scss` in the document head.
- **Parse-first** — parsers run synchronously against the original document before it is hidden. If a parser throws, the error is caught and the original page is shown.
- **`process.env.NODE_ENV` must be defined** — set via `define` in `vite.config.js` so Vue's IIFE bundle doesn't reference the Node.js global at runtime.

---

## Themes

Four themes toggled via `data-theme` attribute on `#hn-modern-root`: `light` (default), `dark`, `nord`, `amoled`. Defined as CSS custom properties on `#hn-modern-root` / `#hn-modern-root[data-theme="..."]` in `main.scss`. Persisted via `chrome.storage.local`.

---

## Parsers

Each parser is a pure function `(doc: Document) → TypedModel`. Implemented so far:

| File | Function | Status |
|------|----------|--------|
| `utils.ts` | shared helpers | ✅ done |
| `header.ts` | `parseHeader` | ✅ done |
| `storyList.ts` | `parseStoryList` | ✅ done |
| `item.ts` | `parseItemPage` | ✅ done |
| `login.ts` | `parseLoginPage` | ✅ done |
| `static.ts` | `parseStaticPage` | ✅ done |
| `user.ts` | `parseUserPage` | 🔲 planned |
| `threads.ts` | `parseThreadsPage` | 🔲 planned |
| `newComments.ts` | `parseNewComments` | 🔲 planned |
| `submit.ts` | `parseSubmitPage` | 🔲 planned |
| `reply.ts` | `parseReplyPage` | 🔲 planned |

Full parser specs (selectors, data models) are in [`plan/03-parsers.md`](plan/03-parsers.md).

---

## Test Fixtures

HTML snapshots of real HN pages live in `test/fixtures/`. Use these when building or testing parsers — do not make live network requests.

---

## Files to Ignore

- `cohesive.tsx` — unrelated React prototype, not part of the extension build.
- `src/content/shared/StoryItem.vue` — legacy component, superseded by `stories/StoryRow.vue`.
- `dist/` — build output, not committed.
