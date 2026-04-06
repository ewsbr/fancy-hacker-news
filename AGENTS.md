# Fancy HackerNews — Agent Guide

A browser extension (Manifest V3, Chrome + Firefox) that fully re-renders every Hacker News page using a Vue 3 app mounted directly into the document body. All data comes from parsing the original HN page DOM — no API calls, no SPA routing.

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

## Commit Conventions

- Use Conventional Commits for git history, e.g. `fix: handle from routes` or `feat: add leaders page parser`.
- Keep the subject line focused on the shipped behavior, in imperative mood.

---

## Primary Docs

- `README.md` — contributor-facing project overview and local loading/build instructions
- `EXTENSION.md` — main Firefox-facing extension description and known quirks
- `DESIGNSYSTEM.md` — shared UI contract for breakpoints, typography, spacing, and interaction rules

Update `DESIGNSYSTEM.md` whenever you materially change breakpoints, shared mobile sizing, action-row behavior, badge sizing, or tap-target conventions.

---

## How It Works (Entry Point Flow)

`src/content/main.ts` runs at `document_end` as the content script:

1. **Parse** — call `parseHeader(document)` + `resolveRoute(location)` against the live HN DOM, then parse page-specific data
2. **Hide** — inject a one-rule `<style>` that hides all original body children
3. **Root Element** — create `div#fancy-hn-root` in the document body; compiled CSS is loaded separately by the manifest as a content-script stylesheet
4. **Mount** — `createApp(App)`, provide `header`, `route`, `pageData`, `renderTime` via `app.provide()`
5. **Render** — Vue renders the full UI inside `#fancy-hn-root`; original HN nodes are stripped from the DOM after first paint

If anything throws, the original HN page is left visible (graceful fallback).

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
│   ├── anti-fouc.js         # inline script injected before parse to suppress FOUC
│   ├── App.vue              # root: reads route, selects page component via PAGE_MAP
│   ├── layout/
│   │   ├── AppShell.vue     # header + <slot> + footer wrapper
│   │   ├── SiteHeader.vue   # logo, nav links, user controls, search trigger, ThemeToggle
│   │   └── SiteFooter.vue   # site links, tagline, search shortcut, metadata
│   ├── pages/
│   │   ├── StoriesPage.vue  # /news, /newest, /front, /ask, /show, /jobs, /submitted, /hidden, favorites
│   │   ├── CommentsPage.vue # /item?id=… — story header + full comment tree
│   │   ├── UserPage.vue     # /user?id=… — profile, karma, about
│   │   ├── ThreadsPage.vue  # /threads?id=… — flat thread list
│   │   ├── NewCommentsPage.vue # /newcomments, /noobcomments, favorites?comments=t
│   │   ├── SubmitPage.vue   # /submit — submission form
│   │   ├── ReplyPage.vue    # /reply?id=… — single-comment reply form
│   │   ├── FormatDocPage.vue # /formatdoc — formatting help
│   │   ├── LeadersPage.vue  # /leaders — karma leaderboard
│   │   ├── LoginPage.vue    # /login, /changepw, /forgot, /comment, /vote
│   │   └── StaticPage.vue   # /newsfaq, /newsguidelines, catch-all
│   ├── stories/
│   │   ├── StoryRow.vue     # single story: rank + vote + title + meta + badges
│   │   ├── StoryRank.vue    # rank number display
│   │   ├── StoryMeta.vue    # score, author, age, comments link, hide/fav actions
│   │   └── StoryDetail.vue  # full story header for the item/comments page
│   ├── comments/
│   │   ├── CommentTree.vue  # top-level comment list renderer
│   │   ├── CommentNode.vue  # recursive node: collapse/expand, indent, threading
│   │   ├── CommentHeader.vue # author, age, badges, nav arrows, collapse toggle
│   │   ├── CommentBody.vue  # comment HTML with depth-based gray styling
│   │   ├── FlatComment.vue  # single flattened comment row (for ThreadsPage / NewCommentsPage)
│   │   ├── OnStoryHeader.vue # "N comments on: <title>" banner used in comment contexts
│   │   ├── SubThreadModal.vue # modal overlay for viewing a sub-thread in context
│   │   └── ThreadNode.vue   # comment row used inside SubThreadModal
│   ├── forms/
│   │   ├── CommentForm.vue  # inline reply form with CSRF fields
│   │   └── SubmitForm.vue   # story submission form fields
│   └── shared/
│       ├── AuthorByline.vue  # author link + "new user" badge
│       ├── Badge.vue         # status badges: new, dead, flagged, downvoted, job
│       ├── CommentActions.vue # vote/reply/edit/delete/flag action row for comments
│       ├── FlagButton.vue    # flag link with confirmation
│       ├── FragmentLinkButton.vue # permalink/hash copy button for comments
│       ├── MetaSep.vue       # separator dot between meta items
│       ├── Pagination.vue    # "More" / prev-next pagination link
│       ├── PollOptions.vue   # poll option rows with vote bars
│       ├── RichText.vue      # HTML renderer with code/quote/link styles
│       ├── SearchModal.vue   # Algolia search overlay (keyboard-triggered)
│       ├── StorySiteLink.vue # external site domain badge next to story title
│       ├── ThemeToggle.vue   # theme swatch picker (light/dark/nord/amoled)
│       ├── Tooltip.vue       # hover tooltip wrapper
│       └── VoteButton.vue    # upvote chevron button
├── parsers/
│   ├── utils.ts             # textOf, attrOf, hrefOf, parseScore, parseAge, …
│   ├── header.ts            # parseHeader(doc) → ParsedHeader
│   ├── storyList.ts         # parseStoryList(doc) → ParsedStoryList
│   ├── item.ts              # parseItemPage(doc) → ParsedItemPage (story + comment tree)
│   ├── login.ts             # parseLoginPage(doc) → ParsedLoginPage
│   ├── static.ts            # parseStaticPage(doc) → ParsedStaticPage
│   ├── user.ts              # parseUserPage(doc) → ParsedUserPage
│   ├── threads.ts           # parseThreadsPage(doc) → ParsedThreadsPage
│   ├── newComments.ts       # parseNewComments(doc) → ParsedNewComments
│   ├── submit.ts            # parseSubmitPage(doc) → ParsedSubmitPage
│   ├── reply.ts             # parseReplyPage(doc) → ParsedReplyPage
│   └── leaders.ts           # parseLeadersPage(doc) → ParsedLeadersPage
├── router/
│   └── index.ts             # resolveRoute(location) → RouteDescriptor (pure fn)
├── state/
│   ├── fragmentState.ts      # shared comment fragment highlight/scroll injection state
│   ├── theme.ts             # useTheme() composable — chrome.storage + data-theme attr
│   └── useIsMobile.ts       # useIsMobile() composable — matchMedia(max-width: 640px)
└── styles/
    ├── main.scss            # font imports, theme CSS vars, global reset, shared utilities
    └── _comment-node.scss   # comment indent/depth/collapse styles (imported by main.scss)
```

---

## Architecture Rules

- **No fetch / no API** — all data is parsed from the original HN DOM before Vue mounts.
- **No SPA navigation** — `resolveRoute` is a pure read of `location` on page load only. All links and forms are native HTML pointing at HN's own servers.
- **CSRF tokens preserved** — `auth=` params in links and `hmac` hidden fields are taken verbatim from the parsed DOM — never hardcoded or fabricated.
- **CSS isolation** — all Vue output and CSS lives inside the `#fancy-hn-root` container; it avoids affecting original HN elements through component scoping and careful selector choice (no shadow DOM used).
- **Styles are SCSS, not Tailwind** — global tokens/reset live in `src/styles/main.scss`; component and page styles live in scoped `lang="scss"` blocks using BEM class names.
- **CSS ships as a real stylesheet** — Vite emits `dist/content/assets/style.css`, and `manifest.json` injects it as a content-script stylesheet.
- **JS asset URLs are extension-aware** — Vite's `renderBuiltUrl` hook emits `chrome.runtime.getURL(...)` for JS-hosted assets so imported images resolve from the extension origin instead of the host page.
- **Parse-first** — parsers run synchronously against the original document before it is hidden. If a parser throws, the error is caught and the original page is shown.
- **`process.env.NODE_ENV` must be defined** — set via `define` in `vite.config.js` so Vue's IIFE bundle doesn't reference the Node.js global at runtime.
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

Four themes toggled via `data-theme` attribute on `#fancy-hn-root`: `light` (default), `dark`, `nord`, `amoled`. Defined as CSS custom properties on `#fancy-hn-root` / `#fancy-hn-root[data-theme="..."]` in `main.scss`. Persisted via `chrome.storage.local`.

---

## Parsers

Each parser is a pure function `(doc: Document) → TypedModel`. All parsers are implemented:

| File | Function | Routes |
|------|----------|--------|
| `utils.ts` | shared helpers | — |
| `header.ts` | `parseHeader` | all pages |
| `storyList.ts` | `parseStoryList` | `/news`, `/ask`, `/show`, `/jobs`, `/submitted`, etc. |
| `item.ts` | `parseItemPage` | `/item?id=` |
| `login.ts` | `parseLoginPage` | `/login`, `/changepw`, `/forgot`, `/vote` |
| `static.ts` | `parseStaticPage` | `/newsfaq`, `/newsguidelines`, `/formatdoc`, catch-all |
| `user.ts` | `parseUserPage` | `/user?id=` |
| `threads.ts` | `parseThreadsPage` | `/threads?id=` |
| `newComments.ts` | `parseNewComments` | `/newcomments`, `/noobcomments`, favorites comments |
| `submit.ts` | `parseSubmitPage` | `/submit` |
| `reply.ts` | `parseReplyPage` | `/reply?id=` |
| `leaders.ts` | `parseLeadersPage` | `/leaders` |

Full parser specs (selectors, data models) are in [`plan/03-parsers.md`](plan/03-parsers.md).

---

## Test Fixtures

HTML snapshots of real HN pages live in `test/fixtures/`. Use these when building or testing parsers — do not make live network requests.

---

## Files to Ignore

- `src/content/shared/StoryItem.vue` — legacy component, superseded by `stories/StoryRow.vue`.
- `dist/` — build output, not committed.
