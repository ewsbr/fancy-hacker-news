# Implementation Checklist

Actionable tasks organized by phase. Each task is independent enough for an agent to pick up.

---

## Phase 1 — Core Infrastructure

- [x] **1.1** Create `src/router/index.ts` — `resolveRoute(location: Location): RouteDescriptor` pure function with full route table (see [02-router.md](02-router.md)) — **already done**
- [x] **1.2** Create `src/parsers/utils.ts` — shared helpers: `textOf`, `attrOf`, `hrefOf`, `parseScore`, `parseCommentCount`, `isNewUser`, `parseAge`, `findMoreLink` — **already done**
- [x] **1.3** Create `src/parsers/header.ts` — `parseHeader(doc: Document): ParsedHeader` extracts nav links, user info, logout URL — **already done**
- [x] **1.4** ~~Download & bundle fonts~~ → Using `@fontsource-variable/*` packages instead (atkinson-hyperlegible-next, inter, jetbrains-mono)
- [x] **1.5** Create `src/styles/main.css` — `@import "tailwindcss"`, `@theme` block with custom colors/fonts, fontsource imports, theme CSS custom properties for all 4 themes on `:host` / `:host([data-theme])`
- [x] **1.6** Ensure `@tailwindcss/vite` plugin is configured in `vite.config.js`
- [x] **1.7** Verify Tailwind works inside shadow DOM (CSS inlined via `?inline` import, injected as `<style>` in shadow root)
- [x] **1.8** Create `src/state/theme.ts` — `useTheme()` composable (read/write `chrome.storage.local`, system preference detection, `data-theme` attribute)
- [x] **1.9** Install `lucide-vue-next` dependency
- [x] **1.10** Create layout components:
  - `src/content/layout/AppShell.vue` — header + main slot + footer
  - `src/content/layout/SiteHeader.vue` — logo, nav links, user controls, ThemeToggle
  - `src/content/layout/SiteFooter.vue` — yclinks, Algolia search link
- [x] **1.11** Create `src/content/shared/ThemeToggle.vue` — theme selector using Lucide icons
- [x] **1.12** Update `src/content/main.ts` — new entry flow: snapshot DOM → parse header → resolve route → hide original → create shadow host → inject CSS → mount Vue with provide/inject
- [x] **1.13** Update `src/content/App.vue` — inject parsed data, resolve page component dynamically via AppShell
- [x] **1.14** Create `src/content/pages/LoginPage.vue` — re-render auth forms (login, changepw, forgot, comment-redirect)
- [x] **1.15** Create `src/content/pages/StaticPage.vue` — re-render informational pages (FAQ, guidelines, leaders, formatdoc)
- [x] **1.16** Update `vite.config.js` — CSS inlined into IIFE bundle via `?inline`, `@tailwindcss/vite` plugin, TS entry, removed SCSS config
- [x] **1.17** Update `manifest.json` — added `storage` permission, removed `css` array (CSS lives in shadow DOM)

---

## Phase 2 — Story Lists

- [x] **2.1** Create `src/parsers/storyList.ts` — `parseStoryList(doc: Document): ParsedStoryList` with all selectors (see [03-parsers.md](03-parsers.md))
- [x] **2.2** Create `src/content/shared/VoteButton.vue` — upvote arrow using Lucide `ChevronUp`, native GET link
- [x] **2.3** Create `src/content/shared/Pagination.vue` — "More" link component
- [x] **2.4** Create story components:
  - `src/content/stories/StoryRank.vue` — rank number display
  - `src/content/stories/StoryMeta.vue` — score, author, age, comments link, hide link
  - `src/content/stories/StoryRow.vue` — single story row composing Rank + Vote + Title + Meta
- [x] **2.5** Refactor `src/content/pages/StoriesPage.vue` — now uses real parsed data via `inject('pageData')`, renders `StoryRow` + `Pagination` (old mock-data + `StoryItem.vue` removed)
- [x] **2.6** Wire StoriesPage into App.vue for `stories` route — already done; `main.ts` now calls `parseStoryList` for stories pages
- [x] **2.7** Test on `/news`, `/newest`, `/front`, `/ask`, `/show`, `/jobs` — verify all story types render correctly
- [x] **2.8** Handle edge cases: job posts (no score/author/comments), "discuss" label, `[pdf]` in title, new-user green author

---

## Phase 3 — Item Pages (Stories + Comments)

- [ ] **3.1** Create `src/parsers/item.js` — `parseItemPage(doc)` for both story-parent and comment-parent
- [ ] **3.2** Create `src/content/shared/RichText.vue` — HTML renderer with code block, quote, and link styling
- [ ] **3.3** Create `src/content/stories/StoryDetail.vue` — full story header for item page (title, URL, score, author, body)
- [ ] **3.4** Create comment components:
  - `src/content/comments/CommentHeader.vue` — author, age, nav links, collapse toggle
  - `src/content/comments/CommentBody.vue` — wraps RichText, handles downvoted/dead styling
  - `src/content/comments/CommentForm.vue` — native POST form with hidden fields
  - `src/content/comments/CommentNode.vue` — recursive: header + body + actions + children
  - `src/content/comments/CommentTree.vue` — renders top-level CommentNode list
- [ ] **3.5** Create `src/content/pages/ItemPage.vue` — story/comment detail + CommentTree + CommentForm
- [ ] **3.6** Wire ItemPage into App.vue for `item` route
- [ ] **3.7** Implement comment collapse/expand (client-side toggle, no server call)
- [ ] **3.8** Implement downvoted comment rendering (reduced opacity, expand on click)
- [ ] **3.9** Implement dead/flagged comment rendering (dimmed, badges)
- [ ] **3.10** Handle comment-parent item pages (show "on: Story Title", context/parent links)
- [ ] **3.11** Test with deeply nested comment threads, dead/flagged comments, new-user authors

---

## Phase 4 — User & Auxiliary Pages

- [ ] **4.1** Create `src/parsers/user.ts` — `parseUserPage(doc: Document): ParsedUserPage` with profile fields, preferences, links
- [ ] **4.2** Create user components:
  - `src/content/user/UserProfile.vue` — username, karma, created, about, preferences form
  - `src/content/user/UserLinks.vue` — submissions, threads, favorites, upvoted links
- [ ] **4.3** Create `src/content/pages/UserPage.vue` — composing UserProfile + UserLinks
- [ ] **4.4** Wire UserPage into App.vue for `user` route
- [ ] **4.5** Create `src/parsers/threads.ts` — `parseThreadsPage(doc: Document): ParsedThreadsPage`
- [ ] **4.6** Create `src/content/pages/ThreadsPage.vue`
- [ ] **4.7** Create `src/parsers/newComments.ts` — `parseNewComments(doc: Document): ParsedNewComments`
- [ ] **4.8** Create `src/content/comments/FlatComment.vue` — single comment with story context
- [ ] **4.9** Create `src/content/pages/NewCommentsPage.vue`
- [ ] **4.10** Create `src/content/pages/FavoritesPage.vue` — reuses StoryRow / FlatComment
- [ ] **4.11** Create `src/parsers/submit.ts` — `parseSubmitPage(doc: Document): ParsedSubmitPage`
- [ ] **4.12** Create `src/content/forms/SubmitForm.vue`
- [ ] **4.13** Create `src/content/pages/SubmitPage.vue`
- [ ] **4.14** Create `src/parsers/reply.ts` — `parseReplyPage(doc: Document): ParsedReplyPage`
- [ ] **4.15** Create `src/content/pages/ReplyPage.vue`
- [ ] **4.16** Wire all new pages into App.vue for their respective routes

---

## Phase 5 — Polish & Edge Cases

- [ ] **5.1** Create `src/content/shared/FlagButton.vue` — flag/unflag with confirmation dialog
- [ ] **5.2** Implement favorite/unfavorite toggle on item pages
- [ ] **5.3** Implement poll rendering (parse poll `<tr>` rows, render as styled list)
- [ ] **5.4** Handle edit/delete windows (parse edit/delete links, render with countdowns if present)
- [ ] **5.5** Error handling: wrap parser calls in try/catch, fall back to showing original HN on failure
- [ ] **5.6** Responsive design: mobile-friendly layout, touch targets, readable on small screens
- [ ] **5.7** Test all themes (light, dark, nord, amoled) across all page types
- [ ] **5.8** Test all form submissions (vote, comment, submit, user profile update, hide, flag, fave)
- [ ] **5.9** Cross-browser testing (Chrome, Firefox if applicable)
- [ ] **5.10** Performance: ensure no FOUC, fast parse-then-render, minimal bundle size

---

## Fixtures Needed

Available:
- [x] `/news` — `test/fixtures/news.html`
- [x] `/item?id=...` (story parent) — `test/fixtures/story.html`
- [x] `/item?id=...` (comment parent) — `test/fixtures/story-comment.html`
- [x] `/user?id=...` (own profile) — `test/fixtures/user.html`

Still needed for complete parser coverage:
- [ ] `/jobs` — job-only story list (no vote/score/comments)
- [ ] `/ask` or `/show` — story with text body in `div.toptext`
- [ ] `/newcomments` — flat comment list
- [ ] `/threads?id=...` — threaded comments with story context
- [ ] `/submitted?id=...` — user submissions list
- [ ] `/favorites?id=...` — favorites list
- [ ] `/submit` — submit form (logged in)
- [ ] `/reply?id=...&goto=...` — reply page
- [ ] `/login` — login form
- [ ] `/user?id=...` (other user, logged out) — read-only profile
- [ ] Item page with poll
- [ ] Item page with `[deleted]` comments
