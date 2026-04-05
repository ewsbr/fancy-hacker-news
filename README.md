# Fancy HackerNews

A browser extension (Manifest V3, Chrome + Firefox) that fully re-renders every Hacker News page using Vue 3. Data is parsed from the original HN HTML before the page is displayed — there are no API calls and no SPA routing.

## Stack

- Vue 3 with `<script setup lang="ts">`
- TypeScript with strict mode and `vue-tsc`
- Raw SCSS with scoped component styles and BEM naming
- Vite 8 IIFE builds for content and background scripts
- Fontsource variable fonts: Atkinson Hyperlegible Next, Manrope, JetBrains Mono
- `lucide-vue-next` icons

## How It Works

The content script (`src/content/main.ts`) runs at `document_end`:

1. Parses the original HN DOM — header, route, and page-specific data
2. Hides all original body children via an injected `<style>` rule
3. Mounts a Vue app into a fresh `div#fancy-hn-root`
4. Strips the original HN nodes after first paint

If anything throws, the original page is left untouched.

## Themes

Four themes switchable from the header: **light** (default), **dark**, **nord**, **amoled**. Persisted in `chrome.storage.local`.

## Project Docs

- `EXTENSION.md` — browser-facing extension description and known quirks
- `DESIGNSYSTEM.md` — shared design-system guidance for breakpoints, sizing, spacing, and interaction rules

## Commands

```bash
pnpm build       # production build (content + background)
pnpm dev         # watch mode (content script only)
pnpm typecheck   # vue-tsc --noEmit
```

## Loading Locally

Build first: `pnpm build`

**Firefox** — `about:debugging#/runtime/this-firefox` → Load Temporary Add-on → select `manifest.json`

**Chrome / Edge** — `chrome://extensions` → Developer mode → Load unpacked → select this folder

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
│   ├── layout/
│   │   ├── AppShell.vue
│   │   ├── SiteHeader.vue
│   │   └── SiteFooter.vue
│   ├── pages/
│   │   ├── StoriesPage.vue      # /news, /newest, /front, /ask, /show, /jobs, /submitted, /hidden, favorites
│   │   ├── CommentsPage.vue     # /item?id=…
│   │   ├── UserPage.vue         # /user?id=…
│   │   ├── ThreadsPage.vue      # /threads?id=…
│   │   ├── NewCommentsPage.vue  # /newcomments, /noobcomments
│   │   ├── SubmitPage.vue       # /submit
│   │   ├── ReplyPage.vue        # /reply?id=…
│   │   ├── FormatDocPage.vue    # /formatdoc
│   │   ├── LeadersPage.vue      # /leaders
│   │   ├── LoginPage.vue        # /login, /changepw, /forgot, /vote
│   │   └── StaticPage.vue       # /newsfaq, /newsguidelines, catch-all
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
│   │   ├── OnStoryHeader.vue
│   │   ├── SubThreadModal.vue
│   │   └── ThreadNode.vue
│   ├── forms/
│   │   ├── CommentForm.vue
│   │   └── SubmitForm.vue
│   └── shared/
│       ├── AuthorByline.vue
│       ├── Badge.vue
│       ├── CommentActions.vue
│       ├── FlagButton.vue
│       ├── FragmentLinkButton.vue
│       ├── MetaSep.vue
│       ├── Pagination.vue
│       ├── PollOptions.vue
│       ├── RichText.vue
│       ├── SearchModal.vue
│       ├── StorySiteLink.vue
│       ├── ThemeToggle.vue
│       ├── Tooltip.vue
│       └── VoteButton.vue
├── parsers/
│   ├── utils.ts
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
│   └── leaders.ts
├── router/
│   └── index.ts
├── state/
│   ├── fragmentState.ts
│   ├── theme.ts
│   └── useIsMobile.ts
└── styles/
    ├── main.scss
    └── _comment-node.scss
```

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
