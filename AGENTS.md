# Fancy HackerNews — Agent Guide

A browser extension (Manifest V3, Chrome + Firefox) that fully re-renders Hacker News pages using a Vue 3 app mounted directly into the document body. Initial page data is parsed from the original HN DOM before mount; interactive controls then use HN's own URLs/endpoints, and search opens Algolia in a new tab. There is still no SPA routing.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI framework | Vue 3 (Composition API, `<script setup lang="ts">`) |
| Language | TypeScript (strict mode, `vue-tsc` for type checking) |
| Styling | Raw SCSS with a global theme/reset layer plus scoped component styles (BEM naming) |
| Build | Vite 8 IIFE build, separate content + background targets |
| Testing | Vitest + fixture-based DOM parsing tests |
| Package manager | pnpm |
| Icons | `lucide-vue-next` |
| UI primitives | `reka-ui` (`TooltipProvider`) |
| Fonts | Atkinson Hyperlegible Next, Manrope, JetBrains Mono (Fontsource variable packages) |

---

## Key Commands

```bash
pnpm build          # build content + background scripts
pnpm package:firefox  # build + package Firefox zip
pnpm package:chrome   # build + package Chrome zip
pnpm dev            # watch mode (content script only)
pnpm typecheck      # vue-tsc --noEmit (type check all .ts/.vue files)
pnpm test           # run Vitest once
pnpm concepts:dev   # run the design concepts playground
```

## Commit Conventions

- Use Conventional Commits for git history, e.g. `fix: handle from routes` or `feat: add 404 page`.
- Keep the subject line focused on the shipped behavior, in imperative mood.

---

## Primary Docs

- `README.md` — contributor-facing project overview and local loading/build instructions
- `EXTENSION.md` — browser-facing extension description and known quirks
- `DESIGNSYSTEM.md` — shared UI contract for breakpoints, typography, spacing, pagination, and interaction rules

Update `DESIGNSYSTEM.md` whenever you materially change breakpoints, shared mobile sizing, action-row behavior, attached-pagination treatment, badge sizing, or tap-target conventions.

---

## How It Works

`src/content/main.ts` runs at `document_end` as the content script:

1. **Parse** — call `parseHeader(document)` + `resolveRoute(location)` against the live HN DOM, then parse page-specific data.
2. **Detect special cases** — if HN returns its literal `Unknown.` body, route to the dedicated `notfound` page.
3. **Prepare reactive state** — item pages pass through `makeItemPageReactive()` so very large comment trees avoid unnecessary deep reactivity work.
4. **Hide / isolate** — inject a one-rule `<style>` that hides original body children, then remove HN source assets (`<link>`, `<style>`, `<script>`) so legacy styles and click handlers cannot interfere.
5. **Root element** — create `div#fancy-hn-root` in the document body; compiled CSS is injected by the manifest as a content-script stylesheet.
6. **Mount** — `createApp(App)`, provide `header`, `route`, `pageData`, `originalDoc`, `isMobileLayout`, and `renderTime` via `app.provide()`.
7. **Shell UI** — `AppShell.vue` owns shared chrome: header, footer, search modal, `Cmd/Ctrl+K` shortcut, and scroll-to-top button.
8. **Render / cleanup** — Vue renders inside `#fancy-hn-root`; original HN nodes are stripped from the DOM after first paint.

If anything throws, the original HN page is left visible.

---

## Source Layout

```
src/
├── debug.ts                 # debug logging + timing helpers (activated via ?debug=1)
├── env.d.ts                 # vite/client + chrome types
├── background/
│   └── background.js        # MV3 service worker (install/update logging)
├── content/
│   ├── main.ts              # entry point: parse → hide → mount → cleanup
│   ├── anti-fouc.ts         # document_start bootstrap script to suppress FOUC
│   ├── App.vue              # root: reads route, selects page component via PAGE_MAP
│   ├── composables/
│   │   └── use-hn-actions.ts  # vote / flag actions against native HN endpoints
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.vue         # shell wrapper; search modal, Cmd/Ctrl+K, scroll-to-top
│   │   │   ├── SiteHeader.vue       # logo, nav links, user controls, search trigger, theme toggle
│   │   │   ├── SiteFooter.vue       # site links, tagline, search trigger, metadata
│   │   │   ├── SearchModal.vue      # search overlay; submits to Algolia in a new tab
│   │   │   ├── SearchTrigger.vue    # reusable search entry point; consumes injected `openSearch`
│   │   │   ├── ScrollToTopButton.vue
│   │   │   ├── ThemeToggle.vue
│   │   │   └── YCombinatorLogo.vue
│   │   ├── stories/
│   │   │   ├── StoryRow.vue
│   │   │   ├── StoryRank.vue
│   │   │   ├── StoryMeta.vue
│   │   │   ├── StoryDetail.vue
│   │   │   ├── StorySiteLink.vue
│   │   │   ├── VoteButton.vue
│   │   │   └── PollOptions.vue
│   │   ├── comments/
│   │   │   ├── CommentBody.vue
│   │   │   ├── CommentHeader.vue
│   │   │   ├── CommentNode.vue
│   │   │   ├── CommentTree.vue
│   │   │   ├── CommentActions.vue
│   │   │   ├── CommentUserMeta.vue
│   │   │   ├── FlagButton.vue
│   │   │   ├── FlatComment.vue
│   │   │   ├── LazyCommentRoot.vue   # lazy-expands deferred comment subtrees from pre-parsed HTML
│   │   │   ├── OnStoryHeader.vue
│   │   │   ├── SubThreadModal.vue
│   │   │   └── ThreadNode.vue
│   │   ├── forms/
│   │   │   ├── CommentForm.vue
│   │   │   └── SubmitForm.vue
│   │   ├── shared/
│   │   │   ├── AuthorByline.vue
│   │   │   ├── FragmentLinkButton.vue
│   │   │   ├── RichText.vue
│   │   │   ├── TopNotice.vue
│   │   │   └── UserCollectionHeader.vue
│   │   └── ui/
│   │       ├── Badge.vue
│   │       ├── Keycap.vue
│   │       ├── MetaSep.vue
│   │       ├── NoticeBanner.vue
│   │       ├── Pagination.vue        # supports standalone + attached card-footer mode
│   │       ├── StripedTableCard.vue
│   │       └── Tooltip.vue
│   ├── pages/
│   │   ├── StoriesPage.vue       # story lists: /news, /newest, /front, /ask, /show, /jobs, /submitted, /hidden, favorites
│   │   ├── CommentsPage.vue      # /item?id=… — story header + threaded comments
│   │   ├── UserPage.vue          # /user?id=… — profile, karma, about
│   │   ├── ThreadsPage.vue       # /threads?id=… — flat thread list
│   │   ├── NewCommentsPage.vue   # /newcomments, /noobcomments, favorites?comments=t
│   │   ├── SubmitPage.vue        # /submit
│   │   ├── ReplyPage.vue         # /reply?id=…
│   │   ├── FormatDocPage.vue     # /formatdoc
│   │   ├── LeadersPage.vue       # /leaders
│   │   ├── ListsPage.vue         # /lists
│   │   ├── TopColorsPage.vue     # /topcolors
│   │   ├── DeleteConfirmPage.vue # /delete-confirm
│   │   ├── LoginPage.vue         # /login, /changepw, /forgot, /comment, /vote
│   │   ├── NotFoundPage.vue      # dedicated 404 UI for HN's `Unknown.` response
│   │   └── StaticPage.vue        # /newsfaq, /newsguidelines, catch-all
│   ├── legacy/
│   ├── utils/
│   │   ├── empty-states.ts
│   │   ├── user-collection-intro.ts
│   │   └── wait.ts
├── parsers/
│   ├── shared/
│   │   ├── age.ts
│   │   ├── body.ts
│   │   ├── comment-row.ts
│   │   ├── comment-tree.ts
│   │   ├── comment.ts
│   │   ├── dom.ts
│   │   ├── pagination.ts
│   │   ├── score.ts
│   │   └── status.ts
│   ├── header.ts
│   ├── story-list.ts
│   ├── item.ts
│   ├── login.ts
│   ├── static.ts
│   ├── user.ts
│   ├── threads.ts
│   ├── new-comments.ts
│   ├── submit.ts
│   ├── reply.ts
│   ├── leaders.ts
│   ├── delete-confirm.ts
│   ├── lists.ts
│   └── top-colors.ts
├── router/
│   └── index.ts             # resolveRoute(location) → RouteDescriptor (pure fn)
├── state/
│   ├── fragment-state.ts
│   ├── item-page-state.ts   # item-page reactivity/performance helpers
│   ├── theme-metadata.ts
│   └── theme.ts
└── styles/
    ├── main.scss
    ├── _theme-tokens.scss
    └── _comment-node.scss
```

---

## Architecture Rules

- **Initial page data comes from the original HN DOM** — parsers read the server-rendered page before mount. There is no custom backend or client-side route loading.
- **No SPA navigation** — `resolveRoute` is a pure read of `location` on page load only. All links and forms are native HTML pointing at HN's own servers.
- **Native HN actions stay native** — vote / flag interactions use HN's own URLs via `use-hn-actions.ts`; search opens Algolia in a separate tab.
- **CSRF tokens preserved** — `auth=` params in links and `hmac` hidden fields are taken verbatim from the parsed DOM — never hardcoded or fabricated.
- **CSS isolation** — all Vue output and CSS lives inside `#fancy-hn-root`; component styles stay scoped and avoid affecting the underlying HN page.
- **Styles are SCSS, not Tailwind** — global tokens/reset live in `src/styles/main.scss`; component and page styles live in scoped `lang="scss"` blocks using BEM-style naming.
- **CSS ships as a real stylesheet** — Vite emits `dist/content/assets/style.css`, and `manifest.json` injects it as a content-script stylesheet.
- **JS asset URLs are extension-aware** — Vite's `renderBuiltUrl` hook emits `chrome.runtime.getURL(...)` for JS-hosted assets so imported images resolve from the extension origin instead of the host page.
- **Parse-first** — parsers run synchronously against the original document before it is hidden. If a parser throws, the error is caught and the original page is shown.
- **Search UI is shell-owned** — `AppShell.vue` provides `openSearch`; `SearchTrigger.vue` consumes it, and `Cmd/Ctrl+K` should keep mapping to the same modal.
- **Connected pagination is a shared pattern** — when `More` continues a list/card surface, keep it inside the same card shell and use `Pagination` with `attached`.
- **`process.env.NODE_ENV` must be defined** — set via `define` in `vite.config.ts` so Vue's IIFE bundle doesn't reference the Node.js global at runtime.
- **Re-injection guard** — on extension reload into an already-modified tab, `mountApp()` detects `#fancy-hn-root` already present and calls `window.location.reload()` to restore the clean server-rendered DOM before re-parsing.
- **Respect source quirks** — if Hacker News emits inconsistent navigation or visibility state, document it before “fixing” it in the parser/UI. Do not silently diverge from source behavior without an explicit product decision.

---

## Responsive Rules

- **Primary mobile breakpoint is `640px`** — this is the default cutoff for mobile density, tap targets, metadata sizing, and card edge treatment.
- **Primary medium/sidebar breakpoint is `768px`** — use this for navigation collapse and larger structural layout shifts.
- **Treat other breakpoints as legacy/layout-specific** — existing values like `980`, `720`, `480`, and `380` should not become new defaults.
- **Standardize before adding** — if a new responsive rule seems necessary, first check whether `640px` or `768px` can express the behavior cleanly.

---

## Themes

Four themes toggled via `data-theme` on `#fancy-hn-root`: `light` (default), `dark`, `nord`, `amoled`. Defined as CSS custom properties in `src/styles/_theme-tokens.scss` and applied in `src/styles/main.scss`. Persisted via `chrome.storage.local`.

---

## Parsers

Each parser is a pure function `(doc: Document) → TypedModel`.

| File | Function | Routes |
|------|----------|--------|
| `utils.ts` | shared helpers | — |
| `header.ts` | `parseHeader` | all pages |
| `story-list.ts` | `parseStoryList` | `/news`, `/ask`, `/show`, `/jobs`, `/submitted`, `/hidden`, favorites stories |
| `item.ts` | `parseItemPage` | `/item?id=` |
| `login.ts` | `parseLoginPage` | `/login`, `/changepw`, `/forgot`, `/vote` |
| `static.ts` | `parseStaticPage` | `/newsfaq`, `/newsguidelines`, `/formatdoc`, catch-all |
| `user.ts` | `parseUserPage` | `/user?id=` |
| `threads.ts` | `parseThreadsPage` | `/threads?id=` |
| `new-comments.ts` | `parseNewComments` | `/newcomments`, `/noobcomments`, favorites comments |
| `submit.ts` | `parseSubmitPage` | `/submit` |
| `reply.ts` | `parseReplyPage` | `/reply?id=` |
| `leaders.ts` | `parseLeadersPage` | `/leaders` |
| `delete-confirm.ts` | `parseDeleteConfirmPage` | `/delete-confirm` |
| `lists.ts` | `parseListsPage` | `/lists` |
| `top-colors.ts` | `parseTopColorsPage` | `/topcolors` |

Full parser specs (selectors, data models) are in `plan/03-parsers.md`.

---

## Test Fixtures

HTML snapshots of real HN pages live in `test/fixtures/`. Use these when building or testing parsers — do not make live network requests for parser coverage.

---

## Files to Ignore

- `dist/` — build output, not committed.
