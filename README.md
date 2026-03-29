# HackerNews Modern UI

A browser extension that fully re-renders Hacker News pages directly into the document body using Vue 3. Data is parsed from the live HN HTML; there are no API calls and no SPA navigation.

## Stack

- Vue 3 with `<script setup lang="ts">`
- TypeScript with `vue-tsc`
- Raw SCSS with scoped component styles and BEM naming
- Vite 8 IIFE builds for content and background scripts
- Fontsource variable fonts: Atkinson Hyperlegible Next, Manrope, JetBrains Mono

## Styling Architecture

- Global theme tokens and site-wide reset live in `src/styles/main.scss`
- Component and page styles live in scoped `lang="scss"` blocks in each Vue SFC
- The content script imports `main.scss` with `?inline`
- A custom Vite plugin inlines component-scoped CSS into `content.js` so all styles render correctly in the main document

## Commands

```bash
pnpm dev
pnpm build
pnpm typecheck
```

## Project Structure

```text
hackernews/
├── manifest.json
├── src/
│   ├── background/
│   │   └── background.js
│   ├── content/
│   │   ├── main.ts
│   │   ├── anti-fouc.js
│   │   ├── App.vue
│   │   ├── layout/
│   │   │   ├── AppShell.vue
│   │   │   ├── SiteHeader.vue
│   │   │   └── SiteFooter.vue
│   │   ├── pages/
│   │   │   ├── StoriesPage.vue
│   │   │   ├── ItemPage.vue
│   │   │   ├── LoginPage.vue
│   │   │   └── StaticPage.vue
│   │   ├── stories/
│   │   │   ├── StoryRow.vue
│   │   │   ├── StoryRank.vue
│   │   │   ├── StoryMeta.vue
│   │   │   └── StoryDetail.vue
│   │   ├── comments/
│   │   │   ├── CommentTree.vue
│   │   │   ├── CommentNode.vue
│   │   │   ├── CommentHeader.vue
│   │   │   ├── CommentBody.vue
│   │   │   └── CommentForm.vue
│   │   └── shared/
│   │       ├── Badge.vue
│   │       ├── Pagination.vue
│   │       ├── RichText.vue
│   │       ├── ThemeToggle.vue
│   │       └── VoteButton.vue
│   ├── parsers/
│   │   ├── utils.ts
│   │   ├── header.ts
│   │   ├── storyList.ts
│   │   ├── item.ts
│   │   ├── login.ts
│   │   └── static.ts
│   ├── router/
│   │   └── index.ts
│   ├── state/
│   │   └── theme.ts
│   ├── styles/
│   │   └── main.scss
│   └── env.d.ts
├── icons/
├── test/
│   └── fixtures/
└── vite.config.js
```

## Browser Support

| Browser | Minimum version | Notes |
|---------|----------------|-------|
| Firefox | 109 | Uses Manifest V3 + `browser_specific_settings.gecko` |
| Chrome / Chromium | 88 | Standard MV3 |
| Edge | 88 | Standard MV3 |

## Loading the Extension Locally

### Firefox
1. Navigate to `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on…** and select `manifest.json`

### Chrome / Chromium / Edge
1. Navigate to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select this folder
