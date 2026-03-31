# Implementation Checklist

Actionable tasks organized by phase. Each task is independent enough for an agent to pick up.

---

## Phase 1 — Core Infrastructure

- [x] **1.1** Create `src/router/index.ts` — `resolveRoute(location: Location): RouteDescriptor` pure function with full route table (see [02-router.md](02-router.md)) — **already done**
- [x] **1.2** Create `src/parsers/utils.ts` — shared helpers: `textOf`, `attrOf`, `hrefOf`, `parseScore`, `parseCommentCount`, `isNewUser`, `parseAge`, `findMoreLink` — **already done**
- [x] **1.3** Create `src/parsers/header.ts` — `parseHeader(doc: Document): ParsedHeader` extracts nav links, user info, logout URL — **already done**
- [x] **1.4** Use `@fontsource-variable/*` packages for extension-bundled fonts (Atkinson Hyperlegible Next, Manrope, JetBrains Mono)
- [x] **1.5** Create `src/styles/main.scss` — font imports, theme tokens, global reset, and shared base styles for `#hn-modern-root`
- [x] **1.6** Configure `vite.config.js` for extension-safe asset output, including real CSS emission and JS asset URL rebinding via `renderBuiltUrl`
- [x] **1.7** Verify manifest-injected CSS works inside the document body and that font URLs resolve from `dist/content/assets/style.css`
- [x] **1.8** Create `src/state/theme.ts` — `useTheme()` composable (read/write `chrome.storage.local`, system preference detection, `data-theme` attribute)
- [x] **1.9** Install `lucide-vue-next` dependency
- [x] **1.10** Create layout components:
  - `src/content/layout/AppShell.vue` — header + main slot + footer
  - `src/content/layout/SiteHeader.vue` — logo, nav links, user controls, ThemeToggle
  - `src/content/layout/SiteFooter.vue` — yclinks, Algolia search link
- [x] **1.11** Create `src/content/shared/ThemeToggle.vue` — theme selector using Lucide icons
- [x] **1.12** Update `src/content/main.ts` — new entry flow: snapshot DOM → parse header → resolve route → hide original → create root host → mount Vue with provide/inject
- [x] **1.13** Update `src/content/App.vue` — inject parsed data, resolve page component dynamically via AppShell
- [x] **1.14** Create `src/content/pages/LoginPage.vue` — re-render auth forms (login, changepw, forgot, comment-redirect)
- [x] **1.15** Create `src/content/pages/StaticPage.vue` — re-render informational pages (FAQ, guidelines, leaders, formatdoc)
- [x] **1.16** Update `vite.config.js` — separate content/background IIFE builds, emitted stylesheet, fixed asset filenames, and extension-aware JS asset URLs
- [x] **1.17** Update `manifest.json` — added `storage` permission, inject emitted content CSS, and expose emitted content assets via `web_accessible_resources`

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

- [x] **3.1** Create `src/parsers/item.ts` — `parseItemPage(doc)` for both story-parent and comment-parent
- [x] **3.2** Create `src/content/shared/RichText.vue` — HTML renderer with code block, quote, and link styling
- [x] **3.3** Create `src/content/stories/StoryDetail.vue` — full story header for item page (title, URL, score, author, body)
- [x] **3.4** Create comment components:
  - `src/content/comments/CommentHeader.vue` — author, age, nav links, collapse toggle
  - `src/content/comments/CommentBody.vue` — wraps RichText, handles downvoted/dead styling
  - `src/content/comments/CommentForm.vue` — native POST form with hidden fields
  - `src/content/comments/CommentNode.vue` — recursive: header + body + actions + children
  - `src/content/comments/CommentTree.vue` — renders top-level CommentNode list
- [x] **3.5** Create `src/content/pages/ItemPage.vue` — story/comment detail + CommentTree + CommentForm
- [x] **3.6** Wire ItemPage into App.vue for `item` route (implemented as `CommentsPage.vue` — both files exist, `CommentsPage` is in use)
- [x] **3.7** Implement comment collapse/expand (client-side toggle, no server call)
- [x] **3.8** Implement downvoted comment rendering (reduced opacity + grayscale via grayLevel; expand-on-click for `noHover`-hidden comments not implemented — shown at reduced opacity instead)
- [x] **3.9** Implement dead/flagged comment rendering (dimmed via grayLevel, `Dead`/`Flagged` badges in CommentHeader)
- [x] **3.10** Handle comment-parent item pages (show "on: Story Title", context/parent links)
- [ ] **3.11** Test with deeply nested comment threads, dead/flagged comments, new-user authors

---

## Phase 4 — User & Auxiliary Pages

- [x] **4.1** Create `src/parsers/user.ts` — `parseUserPage(doc: Document): ParsedUserPage` with profile fields, preferences, links
- [x] **4.2** Create user components:
  - `src/content/user/UserProfile.vue` — username, karma, created, about, preferences form
  - `src/content/user/UserLinks.vue` — submissions, threads, favorites, upvoted links
- [x] **4.3** Create `src/content/pages/UserPage.vue` — composing UserProfile + UserLinks
- [x] **4.4** Wire UserPage into App.vue for `user` route
- [x] **4.5** Create `src/parsers/threads.ts` — `parseThreadsPage(doc: Document): ParsedThreadsPage`
- [x] **4.6** Create `src/content/pages/ThreadsPage.vue`
- [x] **4.7** Create `src/parsers/newComments.ts` — `parseNewComments(doc: Document): ParsedNewComments`
- [x] **4.8** Create `src/content/comments/FlatComment.vue` — single comment with story context
- [x] **4.9** Create `src/content/pages/NewCommentsPage.vue`
- [x] **4.10** Create `src/content/pages/FavoritesPage.vue` — reuses StoryRow / FlatComment
- [x] **4.11** Create `src/parsers/submit.ts` — `parseSubmitPage(doc: Document): ParsedSubmitPage`
- [x] **4.12** Create `src/content/forms/SubmitForm.vue`
- [x] **4.13** Create `src/content/pages/SubmitPage.vue`
- [x] **4.14** Create `src/parsers/reply.ts` — `parseReplyPage(doc: Document): ParsedReplyPage`
- [x] **4.15** Create `src/content/pages/ReplyPage.vue`
- [x] **4.16** Wire all new pages into App.vue for their respective routes

---

## Phase 5 — Polish & Edge Cases

- [x] **5.1** Create `src/content/shared/FlagButton.vue` — flag/unflag with confirmation dialog
- [x] **5.2** Implement favorite/unfavorite toggle on item pages
- [x] **5.3** Implement poll rendering (parse poll `<tr>` rows, render as styled list with bar chart)
- [x] **5.4** Handle edit/delete windows (parse edit/delete links, render with countdowns if present)
- [x] **5.5** Error handling: wrap parser calls in try/catch, fall back to showing original HN on failure
- [x] **5.6** Responsive design: mobile-friendly layout, touch targets, readable on small screens
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
