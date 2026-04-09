# Fancy HackerNews

A browser extension (Manifest V3, Chrome + Firefox) that fully re-renders Hacker News pages using Vue 3. Initial page data is parsed from the original HN HTML before the page is displayed, then interactive controls keep using HN's own URLs/endpoints. There is no SPA routing.

## Stack

- Vue 3 with `<script setup lang="ts">`
- TypeScript with strict mode and `vue-tsc`
- Raw SCSS with scoped component styles and BEM naming
- Vite 8 IIFE builds for content and background scripts
- Vitest for fixture-based parser and UI-state tests
- Fontsource variable fonts: Atkinson Hyperlegible Next, Manrope, JetBrains Mono
- `lucide-vue-next` icons
- `reka-ui` for shared tooltip primitives

## How It Works

The content script (`src/content/main.ts`) runs at `document_end`:

1. Parses the original HN DOM — header, route, and page-specific data
2. Detects HN's literal `Unknown.` response and routes it to a dedicated 404 page
3. Hides the original body children and removes HN source assets
4. Mounts a Vue app into a fresh `div#fancy-hn-root`
5. Renders shared shell UI such as the search modal, `Cmd/Ctrl+K` search shortcut, and scroll-to-top control
6. Strips the original HN nodes after first paint

If anything throws, the original page is left untouched.

## Themes

Four themes switchable from the header: **light** (default), **dark**, **nord**, **amoled**. Persisted in `chrome.storage.local`.

## Project Docs

- `EXTENSION.md` — browser-facing extension description and known quirks
- `DESIGNSYSTEM.md` — shared design-system guidance for breakpoints, sizing, spacing, pagination, and interaction rules
- `AGENTS.md` — repo-specific implementation guide for coding agents and contributors working close to the architecture

## Commands

```bash
pnpm build       # production build (content + background)
pnpm build:firefox
pnpm package:firefox  # build + create a clean AMO-ready zip in web-ext-artifacts/
pnpm dev         # watch mode (content script only)
pnpm typecheck   # vue-tsc --noEmit
pnpm test        # run Vitest once
pnpm test:watch  # run Vitest in watch mode

# design concepts playground
pnpm concepts:dev
pnpm concepts:build
pnpm concepts:preview
```

## Loading Locally

Build first: `pnpm build`

**Firefox** — `about:debugging#/runtime/this-firefox` → Load Temporary Add-on → select `manifest.json`

**Chrome / Edge** — `chrome://extensions` → Developer mode → Load unpacked → select this folder

## Release Packaging

For Firefox Add-ons, use `pnpm package:firefox`.

That script rebuilds the Firefox target, stages only the production extension files, removes sourcemaps from the packaged payload, and writes a versioned ZIP to `web-ext-artifacts/`.

## Project Structure

```
src/
├── debug.ts
├── env.d.ts
├── background/
│   └── background.js
├── content/
│   ├── main.ts
│   ├── anti-fouc.js
│   ├── App.vue
│   ├── composables/
│   │   └── useHnActions.ts
│   ├── layout/
│   │   ├── AppShell.vue
│   │   ├── SiteHeader.vue
│   │   └── SiteFooter.vue
│   ├── pages/
│   │   ├── StoriesPage.vue       # /news, /newest, /front, /ask, /show, /jobs, /submitted, /hidden, favorites
│   │   ├── CommentsPage.vue      # /item?id=…
│   │   ├── UserPage.vue          # /user?id=…
│   │   ├── ThreadsPage.vue       # /threads?id=…
│   │   ├── NewCommentsPage.vue   # /newcomments, /noobcomments, favorites?comments=t
│   │   ├── SubmitPage.vue        # /submit
│   │   ├── ReplyPage.vue         # /reply?id=…
│   │   ├── FormatDocPage.vue     # /formatdoc
│   │   ├── LeadersPage.vue       # /leaders
│   │   ├── ListsPage.vue         # /lists
│   │   ├── TopColorsPage.vue     # /topcolors
│   │   ├── DeleteConfirmPage.vue # /delete-confirm
│   │   ├── LoginPage.vue         # /login, /changepw, /forgot, /vote
│   │   ├── NotFoundPage.vue      # dedicated 404 page for HN's `Unknown.` response
│   │   └── StaticPage.vue        # /newsfaq, /newsguidelines, catch-all
│   ├── stories/
│   │   ├── StoryRow.vue
│   │   ├── StoryRank.vue
│   │   ├── StoryMeta.vue
│   │   └── StoryDetail.vue
│   ├── comments/
│   │   ├── CommentTree.vue
│   │   ├── CommentNode.vue
│   │   ├── CommentHeader.vue
│   │   ├── CommentBody.vue
│   │   ├── FlatComment.vue
│   │   ├── LazyCommentRoot.vue
│   │   ├── OnStoryHeader.vue
│   │   ├── SubThreadModal.vue
│   │   └── ThreadNode.vue
│   ├── forms/
│   │   ├── CommentForm.vue
│   │   └── SubmitForm.vue
│   ├── legacy/
│   └── ui/
│       ├── composites/
│       ├── helpers/
│       ├── modals/
│       ├── primitives/
│       └── shell/
├── parsers/
│   ├── shared/
│   │   ├── age.ts
│   │   ├── body.ts
│   │   ├── comment.ts
│   │   ├── dom.ts
│   │   ├── pagination.ts
│   │   ├── score.ts
│   │   └── status.ts
│   ├── header.ts
│   ├── storyList.ts
│   ├── item.ts
│   ├── login.ts
│   ├── static.ts
│   ├── user.ts
│   ├── threads.ts
│   ├── newComments.ts
│   ├── submit.ts
│   ├── reply.ts
│   ├── leaders.ts
│   ├── deleteConfirm.ts
│   ├── lists.ts
│   └── topColors.ts
├── router/
│   └── index.ts
├── state/
│   ├── fragmentState.ts
│   ├── itemPageState.ts
│   ├── theme.ts
│   └── useIsMobile.ts
└── styles/
    ├── main.scss
    ├── _theme-tokens.scss
    └── _comment-node.scss
```

## Testing

- HTML fixtures live in `test/fixtures/`
- Parser and content behavior tests run through Vitest and `jsdom`
- Prefer fixture-driven parsing tests over live network requests when adding parser coverage

## Browser Support

| Browser | Minimum version |
|---------|----------------|
| Firefox | 109 |
| Chrome / Chromium | 88 |
| Edge | 88 |

## Responsive Defaults

- `640px` is the primary mobile breakpoint
- `768px` is the primary medium/sidebar breakpoint
- Other breakpoints in the repo currently exist for older/footer/profile-specific layouts and should not be treated as the default pattern for new work
