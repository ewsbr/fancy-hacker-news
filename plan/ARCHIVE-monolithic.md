# HackerNews Modern UI — Implementation Plan

> Original brief and page references are preserved at the bottom of this document.

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│  main.js (entry)                                        │
│  ├─ Hide original HN page                               │
│  ├─ Create shadow DOM host                              │
│  ├─ Mount Vue app                                       │
│  └─ Pass original document to parser layer              │
├─────────────────────────────────────────────────────────┤
│  Router (src/router/)                                   │
│  ├─ Reads location.pathname + search params             │
│  ├─ Returns a route descriptor { page, params }         │
│  └─ No navigation — purely declarative URL → page map   │
├─────────────────────────────────────────────────────────┤
│  Parsers (src/parsers/)                                 │
│  ├─ Each parser takes a Document/Element and returns    │
│  │   a typed plain-object model                         │
│  ├─ storyList.js   → Story[]                            │
│  ├─ item.js        → ItemPage (story + comments tree)   │
│  ├─ user.js        → UserProfile                        │
│  ├─ submit.js      → SubmitFormData                     │
│  ├─ header.js      → NavState (links, logged-in user)   │
│  └─ shared utils (parseAge, parseScore, etc.)           │
├─────────────────────────────────────────────────────────┤
│  Vue Components (src/content/)                          │
│  ├─ App.vue (root: resolves route, calls parser,        │
│  │           renders page component)                    │
│  ├─ layout/                                             │
│  │   ├─ AppShell.vue      (header + main + footer)      │
│  │   ├─ SiteHeader.vue    (nav bar, user controls)      │
│  │   └─ SiteFooter.vue    (links, search)               │
│  ├─ pages/                                              │
│  │   ├─ StoriesPage.vue   (news/newest/front/ask/show…) │
│  │   ├─ ItemPage.vue      (story detail + comment tree) │
│  │   ├─ UserPage.vue      (profile + submissions)       │
│  │   ├─ SubmitPage.vue    (submit form)                 │
│  │   ├─ NewCommentsPage.vue (newcomments)               │
│  │   ├─ ThreadsPage.vue   (user threads list)           │
│  │   └─ FavoritesPage.vue (user favorites)              │
│  ├─ stories/                                            │
│  │   ├─ StoryRow.vue      (single story row in list)    │
│  │   ├─ StoryMeta.vue     (points, author, age, etc.)   │
│  │   └─ StoryRank.vue     (rank number + vote arrow)    │
│  ├─ comments/                                           │
│  │   ├─ CommentTree.vue   (recursive tree renderer)     │
│  │   ├─ CommentNode.vue   (single comment)              │
│  │   ├─ CommentHeader.vue (user, age, actions)          │
│  │   ├─ CommentBody.vue   (HTML content renderer)       │
│  │   └─ CommentForm.vue   (reply textarea + buttons)    │
│  ├─ user/                                               │
│  │   ├─ UserProfile.vue   (about, karma, created)       │
│  │   └─ UserLinks.vue     (submissions, comments, etc.) │
│  ├─ shared/                                             │
│  │   ├─ VoteButton.vue    (upvote / downvote / unvote)  │
│  │   ├─ RichText.vue      (renders HN HTML safely)      │
│  │   ├─ Pagination.vue    (More link / page nav)        │
│  │   └─ FlagButton.vue    (flag / vouch)                │
│  └─ forms/                                              │
│      ├─ LoginForm.vue                                   │
│      └─ SubmitForm.vue                                  │
├─────────────────────────────────────────────────────────┤
│  Theme System (src/styles/)                             │
│  ├─ _tokens.scss          (design tokens)               │
│  ├─ themes/                                             │
│  │   ├─ _light.scss                                     │
│  │   ├─ _dark.scss                                      │
│  │   └─ _solarized.scss   (example extra theme)         │
│  ├─ base.scss             (reset + host)                │
│  └─ Theme provider (reactive, persisted in storage)     │
├─────────────────────────────────────────────────────────┤
│  State (src/state/)                                     │
│  ├─ theme.js     (current theme, dark mode toggle)      │
│  └─ settings.js  (user preferences, persisted)          │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Router

**Location:** `src/router/index.js`

Not a real SPA router. A pure function that maps the current `location` to a route descriptor.

```
resolve(location) → { page: string, params: Record<string, string> }
```

### Route table

| URL pattern                        | Page key          | Params             |
|------------------------------------|-------------------|--------------------|
| `/`                                | `stories`         | `{ type: 'top' }` |
| `/news`                            | `stories`         | `{ type: 'top' }` |
| `/newest`                          | `stories`         | `{ type: 'new' }` |
| `/front`                           | `stories`         | `{ type: 'front' }`|
| `/ask`                             | `stories`         | `{ type: 'ask' }` |
| `/show`                            | `stories`         | `{ type: 'show' }` |
| `/jobs`                            | `stories`         | `{ type: 'jobs' }` |
| `/shownew`                         | `stories`         | `{ type: 'shownew' }` |
| `/pool`                            | `stories`         | `{ type: 'pool' }` |
| `/active`                          | `stories`         | `{ type: 'active' }` |
| `/best`                            | `stories`         | `{ type: 'best' }` |
| `/bestcomments`                    | `stories`         | `{ type: 'bestcomments' }` |
| `/noobstories`                     | `stories`         | `{ type: 'noobstories' }` |
| `/newcomments`                     | `newcomments`     | `{}`               |
| `/noobcomments`                    | `newcomments`     | `{ type: 'noob' }`|
| `/item`                            | `item`            | `{ id }`           |
| `/reply`                           | `reply`           | `{ id, goto }`     |
| `/user`                            | `user`            | `{ id }`           |
| `/submitted`                       | `submitted`       | `{ id }`           |
| `/threads`                         | `threads`         | `{ id }`           |
| `/favorites`                       | `favorites`       | `{ id, comments? }`|
| `/upvoted`                         | `upvoted`         | `{ id }`           |
| `/hidden`                          | `hidden`          | `{ id }`           |
| `/submit`                          | `submit`          | `{}`               |
| `/login`                           | `login`           | `{}`               |
| `/comment`                         | `login`           | `{}`               |
| `/changepw`                        | `login`           | `{}`               |
| `/forgot`                          | `login`           | `{}`               |
| `/newsfaq`                         | `static`          | `{}`               |
| `/newsguidelines`                  | `static`          | `{}`               |
| `/leaders`                         | `static`          | `{}`               |
| `/formatdoc`                       | `static`          | `{}`               |
| default                            | `static`          | `{}`               |

All pages are re-rendered with modern styling. `login` pages show auth forms. `static` pages re-render informational/text content. No page is left unstyled.

---

## 3. Parser Layer

**Location:** `src/parsers/`

Each parser is a pure function: `(doc: Document) → ParsedModel`. Parsers work on the **original** HN DOM before our Vue app replaces it. We must snapshot/clone the original document body in `main.js` before hiding it.

### DOM Conventions (from fixture analysis)

- HN uses `table#hnmain` as the outer shell, everything inside `body > center > table#hnmain`
- The `html` element has an `op` attribute: `op="news"`, `op="item"`, etc.
- Vote, hide, favorite, logout are **GET links** with `auth=` tokens (not forms)
- Comment/submit are **POST forms** with hidden `hmac` field
- New-user indicator: `<font color="#3c963c">` wrapping the username text inside `a.hnuser`
- Comment body state classes on `div.commtext`: `c00` (normal), `c5A` (mid-grey), `cDD` (dead/grey)
- Collapsed comments: `tr.athing.comtr.coll` + `.nosee` on vote cell + `.noshow` on body
- Dead/flagged markers: literal `[dead]` and `[flagged]` text nodes in `span.comhead`
- Indentation: `td.ind[indent="N"]` where N is the nesting depth (0-based). Spacer: `img[width="N*40"]`

### 3.1 `header.js` — Parse Site Header

Extracts from the `table#hnmain` header row:
- Navigation links (from `span.pagetop` with `b.hnname` and sibling links)
- Logged-in username (from `a#me[href^="user?id="]`)
- Karma count (from `span#karma`)
- Logout URL (from `a#logout[href^="logout?auth="]`)

```js
parseHeader(doc) → {
  navLinks: { label, href, active }[],
  user: { name, karma } | null,
  logoutUrl: string | null,
}
```

### 3.2 `storyList.js` — Parse Story Lists

Used for `/news`, `/newest`, `/front`, `/ask`, `/show`, `/jobs`, `/best`, `/active`, `/noobstories`, `/submitted`, `/upvoted`, `/favorites`, `/hidden`, etc.

Each story in the list is **3 `<tr>` elements**: `tr.athing.submission` (rank + title), the sibling `<tr>` (subtext/metadata), and `tr.spacer`.

Selectors:
- Story id: `tr.athing.submission[id]`
- Rank: `td.title > span.rank`
- Vote link: `a#up_<id>.clicky[href^="vote?"]`
- Title + URL: `span.titleline > a` (first `<a>` child)
- Site domain: `span.sitebit.comhead > a > span.sitestr`
- Score: `span.score#score_<id>`
- Author: `a.hnuser` (check for child `<font color="#3c963c">` → new user)
- Age text: `span.age > a` (exact timestamp in `span.age[title]`)
- Hide link: `a.clicky.hider[href^="hide?"]`
- Comment link: last `a[href^="item?id="]` in `.subline`
- "discuss" vs "N comments": text content of comment link

```js
parseStoryList(doc) → {
  stories: Story[],
  moreLink: string | null,      // href for "More" pagination
  startRank: number,             // e.g. 1 or 31
}

Story = {
  id: string,
  rank: number,
  title: string,
  url: string | null,            // null for text posts (Ask HN, etc.)
  site: string | null,           // display domain
  score: number | null,          // null for job posts
  author: string | null,         // null for job posts
  age: string,                   // "3 hours ago"
  ageLink: string,               // /item?id=...
  commentCount: number | null,   // null for job posts
  commentLink: string | null,
  isJob: boolean,
  // Vote state:
  voteUp: string | null,         // vote URL (if user can upvote)
  voteUn: string | null,         // unvote URL (if already voted)
}
```

### 3.3 `item.js` — Parse Item Page (Story + Comments)

The item page has two distinct sections:
1. **Primary item** in `table.fatitem` (story OR comment at top)
2. **Comment tree** in `table.comment-tree` below

When the primary item is a **story**: `table.fatitem` contains `tr.athing.submission` + subtext row + `div.toptext` (body, empty for link posts) + comment form.

When the primary item is a **comment**: `table.fatitem` contains a single `tr.athing` with `span.comhead`, `div.commtext`, `span.onstory` link, and comment reply form.

```js
parseItemPage(doc) → {
  // The parent item (story or comment)
  item: {
    id: string,
    type: 'story' | 'comment',
    title: string | null,         // null when parent is a comment
    url: string | null,
    site: string | null,
    score: number | null,
    author: string,
    authorIsNew: boolean,          // green font indicator
    age: string,
    ageTimestamp: string,          // ISO timestamp from span.age[title]
    ageLink: string,
    bodyHtml: string | null,       // div.toptext for stories, div.commtext for comments
    parentLink: string | null,     // link to parent (from span.navs, comment parents)
    contextLink: string | null,    // link to context in story thread
    storyTitle: string | null,     // from span.onstory (comment parents only)
    storyLink: string | null,      // from span.onstory (comment parents only)
    voteUp: string | null,
    voteDown: string | null,
    voteUn: string | null,
    hideUrl: string | null,        // hide?id=...&auth=...
    pastUrl: string | null,        // hn.algolia.com past link (.hnpast)
    favoriteUrl: string | null,    // fave?id=...&auth=...
    flagUrl: string | null,
  },

  // Comment tree (can be deeply nested)
  comments: CommentNode[],

  // Reply/comment form (if user is logged in)
  replyForm: {
    action: string,                // "comment"
    hmac: string,                  // hidden HMAC field
    parentId: string,
    gotoUrl: string,
    submitLabel: string,           // "add comment" or "reply"
  } | null,
}

CommentNode = {
  id: string,
  author: string,
  authorIsNew: boolean,           // <font color="#3c963c"> wrapping username
  age: string,
  ageTimestamp: string,           // ISO timestamp from span.age[title]
  ageLink: string,
  bodyHtml: string,               // from div.commtext
  bodyClass: string,              // 'c00' | 'c5A' | 'cDD' — color/state
  indent: number,                 // from td.ind[indent] attribute
  isCollapsed: boolean,           // tr has .coll class
  isDead: boolean,                // [dead] text in comhead
  isFlagged: boolean,             // [flagged] text in comhead
  isDownvoted: boolean,           // bodyClass is 'cDD' or 'c5A'
  collapsedCount: number,         // from a.togg[n] attribute
  voteUp: string | null,
  voteDown: string | null,
  voteUn: string | null,
  flagUrl: string | null,
  replyLink: string | null,       // /reply?id=...&goto=...
  navLinks: {                     // from span.navs
    root: string | null,
    parent: string | null,
    prev: string | null,
    next: string | null,
    context: string | null,
  },
  children: CommentNode[],
}
```

#### Comment nesting strategy

HN uses a flat list of `<tr class="athing comtr">` rows, with nesting expressed by `td.ind[indent="N"]` where N is the depth (0-based). The spacer image width is `N * 40` pixels but we use the `indent` attribute directly.

The parser builds a tree by:
1. Iterating through comment rows in order
2. Reading `depth` from `td.ind[indent]` attribute
3. Using a stack to track the current parent at each depth level
4. Pushing each comment as a child of the correct parent

Selectors for each comment row (`tr.athing.comtr#<id>`):
- Indent: `td.ind[indent]`
- Vote link: `td.votelinks a#up_<id>.clicky`
- Author: `span.comhead > a.hnuser` (check for `<font color="#3c963c">` → new user)
- Age: `span.comhead > span.age > a`
- Timestamp: `span.age[title]`
- Dead/flagged: text nodes `[dead]`, `[flagged]` in `span.comhead`
- Nav links: `span.navs` contains root/parent/prev/next/context links
- Collapse toggle: `a.togg.clicky[n]` (n = collapsed child count)
- Comment body: `div.comment > div.commtext` (state class: `.c00`, `.c5A`, `.cDD`)
- Reply link: `div.reply a[href^="reply?"]`
- Collapsed: `tr.athing.comtr.coll` class present

For the item-page **fatitem** parent (when comment is primary):
- Same selectors but inside `table.fatitem`
- Has `span.onstory` with link back to story
- Has `a[href^="fave?"]` for favorite
- Context link: `a[href*="#"]` in `span.navs`

### 3.4 `newComments.js` — Parse New/Noob Comments Page

The `/newcomments` and `/noobcomments` pages have a flat list of comments (not nested), each with a link back to the parent story.

```js
parseNewComments(doc) → {
  comments: FlatComment[],
  moreLink: string | null,
}

FlatComment = {
  id: string,
  author: string,
  age: string,
  ageLink: string,
  bodyHtml: string,
  onStory: { title: string, link: string },
  isNew: boolean,
  voteUp: string | null,
  voteDown: string | null,
  voteUn: string | null,
}
```

### 3.5 `user.js` — Parse User Profile

```js
parseUserPage(doc) → {
  username: string,
  created: string,                // date string
  createdLink: string,            // link to front?day=...&birth=...
  karma: number,
  about: string | null,           // HTML from textarea
  email: string | null,           // only if viewing own profile (editable)
  isOwnProfile: boolean,
  // Preferences (own profile only):
  preferences: {
    showDead: string | null,      // showd select value
    noprocrast: string | null,    // nopro select value
    maxVisit: string | null,      // maxv input value
    minAway: string | null,       // mina input value
    delay: string | null,         // delay input value
  } | null,
  // Edit form (own profile only):
  editForm: {
    action: string,               // /xuser
    hmac: string,
    userId: string,
  } | null,
  // Links:
  changePwLink: string | null,    // only own profile
  submissionsLink: string,
  threadsLink: string,
  upvotedLink: string | null,     // only own profile
  upvotedCommentsLink: string | null,
  favoritesLink: string,
  favoritesCommentsLink: string | null,
}
```

### 3.6 `threads.js` — Parse Threads Page

The threads page (`/threads?id=X`) shows a user's comments in context. It's a list of comment+context blocks.

```js
parseThreadsPage(doc) → {
  username: string,
  threads: ThreadEntry[],
  moreLink: string | null,
}

ThreadEntry = {
  ...CommentNode,               // same fields as a comment
  onStory: { title: string, link: string } | null,
}
```

### 3.7 `submit.js` — Parse Submit Page

```js
parseSubmitPage(doc) → {
  form: {
    action: string,
    fnid: string,                // hidden field
    fnop: string,                // hidden field
    fields: { name: string, value: string, type: string }[],
  },
}
```

### 3.8 `reply.js` — Parse Reply Page

The reply page (`/reply?id=X&goto=...`) shows the parent comment and a reply form.

```js
parseReplyPage(doc) → {
  parent: {
    author: string,
    age: string,
    bodyHtml: string,
  },
  replyForm: {
    action: string,
    hmac: string,
    parentId: string,
    gotoUrl: string,
  },
}
```

---

## 4. Content Rendering — Vue Components

### 4.1 Component Hierarchy

```
App.vue
└─ AppShell.vue
   ├─ SiteHeader.vue
   │   ├─ Logo + nav links
   │   ├─ User controls (login/logout/karma)
   │   └─ ThemeToggle.vue (dark/light switcher)
   ├─ <router-view equivalent — dynamic page component>
   │   ├─ StoriesPage.vue
   │   │   └─ StoryRow.vue (×N)
   │   │       ├─ StoryRank.vue
   │   │       ├─ VoteButton.vue
   │   │       └─ StoryMeta.vue
   │   ├─ ItemPage.vue
   │   │   ├─ StoryDetail.vue (when parent is story)
   │   │   │   ├─ VoteButton.vue
   │   │   │   ├─ RichText.vue
   │   │   │   └─ StoryMeta.vue
   │   │   ├─ CommentDetail.vue (when parent is comment)
   │   │   │   ├─ VoteButton.vue
   │   │   │   └─ RichText.vue
   │   │   ├─ CommentForm.vue
   │   │   └─ CommentTree.vue
   │   │       └─ CommentNode.vue (recursive)
   │   │           ├─ CommentHeader.vue
   │   │           ├─ CommentBody.vue → RichText.vue
   │   │           ├─ VoteButton.vue
   │   │           └─ CommentForm.vue (inline reply)
   │   ├─ UserPage.vue
   │   │   ├─ UserProfile.vue
   │   │   └─ UserLinks.vue
   │   ├─ NewCommentsPage.vue
   │   │   └─ FlatComment.vue (×N)
   │   ├─ ThreadsPage.vue
   │   │   └─ ThreadEntry.vue (×N)
   │   ├─ FavoritesPage.vue    (reuses StoryRow / FlatComment)
   │   ├─ SubmitPage.vue
   │   │   └─ SubmitForm.vue
   │   ├─ ReplyPage.vue
   │   │   ├─ RichText.vue (parent comment)
   │   │   └─ CommentForm.vue
   │   ├─ LoginPage.vue     (login / changepw / forgot forms)
   │   └─ StaticPage.vue    (FAQ, guidelines, leaders, formatdoc)
   ├─ SiteFooter.vue
   └─ Pagination.vue
```

### 4.2 Key Component Details

#### `RichText.vue` — Safe HTML Renderer

HN serves pre-sanitized HTML in comments and about fields. This component:
- Renders the trusted HN HTML via `v-html`
- Adds CSS for code blocks (HN uses `<pre><code>`)
- Styles `<p>` tags from HN (HN double-linebreaks become `<p>`)
- Renders blockquotes (HN convention: lines starting with `>` are wrapped in `<i>` — we detect and style these as proper blockquotes)
- Handles HN links (add `target="_blank"` + `rel="noopener"`)

#### `VoteButton.vue` — Vote/Unvote

- Renders upvote (▲) and optionally downvote (▼) arrows
- Clicking submits a standard GET request to the vote URL (same as original HN)
- Shows current state: unvoted, upvoted, downvoted
- Graceful when vote URLs are absent (not logged in)

#### `CommentNode.vue` — Recursive Comment

- Renders a single comment with: header, body, actions, reply form
- Recursively renders `children` CommentNodes
- Handles collapsed state (toggle with click on `[+]`/`[-]`)
- Handles downvoted/greyed-out state (reduced opacity, expandable)
- Green username styling for new users (`isNew`)
- Indentation via CSS `margin-left` based on depth (not spacer gifs)

#### `CommentForm.vue` — Reply Form

- Renders a `<form>` pointing at HN's native form action
- Includes hidden fields (hmac, parent, goto) from parsed data
- Standard `<textarea>` for comment text
- Submit is a real form POST (no JS fetch) — keeps HN's native submission flow
- Only visible when user is logged in (form data present)

#### `LoginPage.vue` — Auth Forms

Re-renders login, changepw, comment-requires-login, and forgot-password pages:
- Parses the existing form from HN DOM (action URL, hidden fields)
- Renders a modern styled form with the same fields
- Form submits via native POST to HN's endpoints
- No JS-based auth — purely re-skinned forms

#### `StaticPage.vue` — Informational Pages

Re-renders FAQ, guidelines, leaders, formatdoc and any unknown pages:
- Extracts the main content area from HN DOM
- Renders it inside the themed shell via RichText
- Preserves all links and structure

---

## 5. Theme System

### 5.1 Architecture

- Themes are defined as SCSS maps of token overrides
- The active theme is applied by toggling a `data-theme` attribute on the shadow root's `:host`
- Theme preference is persisted in `chrome.storage.local`
- A reactive Vue composable (`useTheme()`) provides the current theme + toggle function
- System dark mode preference is detected via `matchMedia('(prefers-color-scheme: dark)')` and used as default

### 5.2 Token Structure

#### Typography

- **Body font:** [Atkinson Hyperlegible Next](https://fonts.google.com/specimen/Atkinson+Hyperlegible) — used for all body text, comments, meta, nav
- **Title font:** [Inter](https://fonts.google.com/specimen/Inter) — used for story titles, page headings, and the header bar
- **Mono font:** JetBrains Mono (or Fira Mono fallback) — code blocks

Fonts are bundled as WOFF2 files in `src/assets/fonts/` and loaded via `@font-face` declarations in the base stylesheet. Vite inlines them into the IIFE bundle (via `?inline` or small file threshold). This keeps the extension self-contained with no external network requests for fonts.

```scss
$font-body:  'Atkinson Hyperlegible Next', system-ui, sans-serif;
$font-title: 'Inter', system-ui, sans-serif;
$font-mono:  'JetBrains Mono', 'Fira Mono', Consolas, monospace;
```

```scss
// themes/_light.scss
$theme-light: (
  color-bg:          #f6f6ef,
  color-surface:     #ffffff,
  color-accent:      #ff6600,
  color-text:        #1a1a1a,
  color-text-muted:  #828282,
  color-border:      #e0e0e0,
  color-code-bg:     #f5f5f5,
  color-quote-border:#ff6600,
  color-downvoted:   #b0b0b0,
  color-new-user:    #3c963c,
);

// themes/_dark.scss
$theme-dark: (
  color-bg:          #1a1a1a,
  color-surface:     #2d2d2d,
  color-accent:      #ff7733,
  color-text:        #e0e0e0,
  color-text-muted:  #999999,
  color-border:      #404040,
  color-code-bg:     #2a2a2a,
  color-quote-border:#ff7733,
  color-downvoted:   #666666,
  color-new-user:    #5cb85c,
);

// themes/_nord.scss
$theme-nord: (
  color-bg:          #2e3440,
  color-surface:     #3b4252,
  color-accent:      #88c0d0,
  color-text:        #eceff4,
  color-text-muted:  #a0a8b7,
  color-border:      #4c566a,
  color-code-bg:     #3b4252,
  color-quote-border:#88c0d0,
  color-downvoted:   #616e88,
  color-new-user:    #a3be8c,
);

// themes/_amoled.scss
$theme-amoled: (
  color-bg:          #000000,
  color-surface:     #111111,
  color-accent:      #ff6600,
  color-text:        #e0e0e0,
  color-text-muted:  #777777,
  color-border:      #222222,
  color-code-bg:     #0a0a0a,
  color-quote-border:#ff6600,
  color-downvoted:   #555555,
  color-new-user:    #5cb85c,
);
```

### 5.3 Theme application

```scss
:host {
  // Default (light) tokens via CSS custom properties
  --color-bg: #{map-get($theme-light, color-bg)};
  // ...

  &[data-theme="dark"] {
    --color-bg: #{map-get($theme-dark, color-bg)};
    // ...
  }

  &[data-theme="nord"] {
    --color-bg: #{map-get($theme-nord, color-bg)};
    // ...
  }

  &[data-theme="amoled"] {
    --color-bg: #{map-get($theme-amoled, color-bg)};
    // ...
  }
}
```

All components use `var(--color-xxx)` — no direct SCSS color references in components.

Available themes: **Light** (default), **Dark**, **Nord**, **AMOLED Black**.

---

## 6. Entry Point Flow (`main.js`)

```
1. Check pathname against PASSTHROUGH_ROUTES
   → if match: apply minimal theme overlay, stop
2. Snapshot the original document body (clone or extract data)
3. Parse header from original DOM
4. Resolve route via router
5. Call appropriate parser for the resolved page
6. Hide original HN DOM (display: none on body children)
7. Create shadow DOM host
8. Mount Vue app, passing parsed data as provide/inject
9. Vue renders the modern UI inside the shadow root
```

### Key design decision: Parse-then-render

We parse data from the DOM **before** mounting Vue and hiding the original page. This means:
- Parsing is synchronous and complete before render
- No flash of unstyled content — original HN is hidden right before Vue mounts
- If parsing fails, we can fall back to showing original HN

---

## 7. Form Handling — No SPA, No Fetch

All interactions that change state (voting, commenting, submitting, flagging) use **native HTML form submissions or link clicks**, same as original HN:

- **Vote:** `<a href="/vote?id=...&how=up&auth=...">` — standard link click
- **Comment:** `<form method="POST" action="/comment">` with hidden fields
- **Submit:** `<form method="POST" action="/r">` with hidden fields
- **Flag:** `<a href="/flag?id=...&auth=...">` — standard link click
- **Favorite:** `<a href="/fave?id=...&auth=...">` — standard link click
- **Hide:** `<a href="/hide?id=...&auth=...">` — standard link click

We preserve all CSRF tokens, hidden form fields, and auth params parsed from the original DOM. The browser handles the full page reload on form submission, just like original HN.

---

## 8. HN Hidden Features to Support

| Feature | Detection | Implementation |
|---------|-----------|---------------|
| **New user green name** | `a.hnuser` contains `<font color="#3c963c">` | `authorIsNew: true` → CSS `.comment-author--new { color: var(--color-new-user) }` |
| **Downvoted comment fade** | `div.commtext.cDD` or `.c5A` body class | `isDownvoted: true` → CommentNode renders with reduced opacity + "expand" button |
| **Collapsible comments** | `tr.athing.comtr.coll` + `a.togg[n]` | `[–]` toggle; collapsed = hide body + children, show `[N more]` count from `n` attr |
| **Dead comments** | `[dead]` text node in `span.comhead` | `isDead: true` → show dimmed text, no vote arrow (vote cell has static `img` not link) |
| **Flagged comments** | `[flagged]` text node in `span.comhead` | `isFlagged: true` → show `[flagged]` badge, dimmed appearance |
| **Vouch** | Link from parsed DOM (if available) | Action button on dead comments |
| **Favorite/unfavorite** | `a[href^="fave?id="]` in subtext | Toggle link on item detail |
| **Hide** | `a.clicky.hider[href^="hide?"]` | Hide button in story row actions |
| **Flag/unflag** | `a[href^="flag?id="]` (if present) | Confirm dialog before flagging |
| **Past stories link** | `a.hnpast[href*="hn.algolia.com"]` | "Past" link in story detail meta |
| **Comment navigation** | `span.navs` with root/parent/prev/next links | Render nav pill links in CommentHeader |
| **"discuss" vs "N comments"** | Last `a[href^="item?"]` text in `.subline` | Correct label from parsed text |
| **Story with text body** | `div.toptext` non-empty in `table.fatitem` | Render body HTML via RichText below title |
| **Edit deadline** | Edit link with countdown (if present in DOM) | Render if parsed |
| **Delete window** | Delete link on own recent comments (if present) | Render if parsed |
| **On-story context** | `span.onstory` with story title link | Show "on: Story Title" in comment-parent pages |

---

## 9. Rich Content Rendering

### 9.1 Code Blocks

HN wraps code in `<pre><code>...</code></pre>`. CSS:

```scss
pre {
  background: var(--color-code-bg);
  border-radius: var(--radius);
  padding: var(--spacing-sm) var(--spacing-md);
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 0.85em;
  line-height: 1.4;
}
```

### 9.2 Quotes

HN convention: quoted text is wrapped in `<i>` tags (from lines starting with `>`). The `RichText.vue` component detects `<p>` tags whose only child is an `<i>` tag and wraps them in a styled blockquote:

```scss
.rich-text .quote {
  border-left: 3px solid var(--color-quote-border);
  padding-left: var(--spacing-md);
  color: var(--color-text-muted);
  font-style: italic;
  margin: var(--spacing-sm) 0;
}
```

### 9.3 Links

External links get `target="_blank"` and proper `rel="noopener noreferrer"`. Internal HN links stay as normal navigation.

---

## 10. File Structure (Target)

```
src/
├─ router/
│  └─ index.js                  # resolveRoute(location) → RouteDescriptor
├─ parsers/
│  ├─ header.js                 # parseHeader(doc)
│  ├─ storyList.js              # parseStoryList(doc)
│  ├─ item.js                   # parseItemPage(doc)
│  ├─ newComments.js            # parseNewComments(doc)
│  ├─ user.js                   # parseUserPage(doc)
│  ├─ threads.js                # parseThreadsPage(doc)
│  ├─ submit.js                 # parseSubmitPage(doc)
│  ├─ reply.js                  # parseReplyPage(doc)
│  └─ utils.js                  # shared parsing helpers
├─ state/
│  ├─ theme.js                  # useTheme() composable
│  └─ settings.js               # useSettings() composable
├─ content/
│  ├─ App.vue                   # root component
│  ├─ main.js                   # entry point
│  ├─ layout/
│  │  ├─ AppShell.vue
│  │  ├─ SiteHeader.vue
│  │  └─ SiteFooter.vue
│  ├─ pages/
│  │  ├─ StoriesPage.vue
│  │  ├─ ItemPage.vue
│  │  ├─ UserPage.vue
│  │  ├─ NewCommentsPage.vue
│  │  ├─ ThreadsPage.vue
│  │  ├─ FavoritesPage.vue
│  │  ├─ SubmitPage.vue
│  │  ├─ ReplyPage.vue
│  │  ├─ LoginPage.vue
│  │  └─ StaticPage.vue
│  ├─ stories/
│  │  ├─ StoryRow.vue
│  │  ├─ StoryMeta.vue
│  │  ├─ StoryDetail.vue
│  │  └─ StoryRank.vue
│  ├─ comments/
│  │  ├─ CommentTree.vue
│  │  ├─ CommentNode.vue
│  │  ├─ CommentHeader.vue
│  │  ├─ CommentBody.vue
│  │  ├─ CommentForm.vue
│  │  └─ FlatComment.vue
│  ├─ user/
│  │  ├─ UserProfile.vue
│  │  └─ UserLinks.vue
│  ├─ shared/
│  │  ├─ VoteButton.vue
│  │  ├─ RichText.vue
│  │  ├─ Pagination.vue
│  │  ├─ FlagButton.vue
│  │  └─ ThemeToggle.vue
│  └─ forms/
│     └─ SubmitForm.vue
├─ assets/
│  └─ fonts/
│     ├─ atkinson-hyperlegible-next-*.woff2
│     ├─ inter-*.woff2
│     └─ jetbrains-mono-*.woff2
├─ styles/
│  ├─ _tokens.scss
│  ├─ base.scss
│  └─ themes/
│     ├─ _light.scss
│     ├─ _dark.scss
│     ├─ _nord.scss
│     └─ _amoled.scss
└─ background/
   └─ background.js
```

---

## 11. Implementation Phases

### Phase 1 — Core Infrastructure
1. Router module
2. Parser utilities (`src/parsers/utils.js`)
3. Header parser
4. Theme system (light + dark tokens, `useTheme()`, storage persistence)
5. AppShell / SiteHeader / SiteFooter layout components
6. Update `main.js` entry flow (snapshot DOM, parse, hide, mount)
7. LoginPage + StaticPage (re-rendered auth & info pages)

### Phase 2 — Story Lists
1. Story list parser (`storyList.js`)
2. StoriesPage, StoryRow, StoryRank, StoryMeta components
3. VoteButton component
4. Pagination component
5. Test across page types: /news, /newest, /front, /ask, /show, /jobs

### Phase 3 — Item Pages (Stories + Comments)
1. Item page parser (`item.js`) — story header + comment tree builder
2. ItemPage, StoryDetail components
3. CommentTree, CommentNode, CommentHeader, CommentBody
4. RichText component (code blocks, quotes, links)
5. CommentForm (reply forms)
6. Collapsed comments, downvoted comments, new-user styling
7. Handle both story-parent and comment-parent item pages

### Phase 4 — User & Auxiliary Pages
1. User page parser (`user.js`)
2. UserPage, UserProfile, UserLinks
3. Threads page parser + ThreadsPage
4. New comments parser + NewCommentsPage
5. FavoritesPage (reuses story/comment components)
6. Submit page parser + SubmitPage
7. Reply page parser + ReplyPage

### Phase 5 — Polish & Edge Cases
1. Flag/vouch functionality
2. Favorite/unfavorite toggle
3. Poll rendering
4. Dead comment display
5. Edit/delete windows
6. Error state handling (parse failures → graceful fallback)
7. Responsive design tweaks
8. Additional themes (solarized, etc.)

---

## 12. Data Flow Diagram

```
  ┌──────────────────┐
  │  HN Server HTML  │
  └────────┬─────────┘
           │ (page load, full document)
           ▼
  ┌──────────────────┐
  │   main.js        │
  │   entry point    │
  │                  │
  │  1. Clone DOM    │
  │  2. Detect route │
  │  3. Parse DOM    │
  │  4. Hide orig    │
  │  5. Mount Vue    │
  └────────┬─────────┘
           │ provide({ route, parsedData, headerData })
           ▼
  ┌──────────────────┐
  │   App.vue        │
  │   + AppShell     │
  │                  │
  │  Receives parsed │
  │  data via inject │
  │  Picks page comp │
  └────────┬─────────┘
           │ props
           ▼
  ┌──────────────────┐     ┌──────────────┐
  │   Page Component │────▶│  Sub-comps   │
  │   (e.g. Stories) │     │  (StoryRow,  │
  │                  │     │   VoteBtn…)  │
  └──────────────────┘     └──────┬───────┘
                                  │ <a href="..."> / <form action="...">
                                  ▼
                           ┌──────────────┐
                           │  HN Server   │
                           │  (full page  │
                           │   reload)    │
                           └──────────────┘
```

---

## 13. Crawling Strategy for Page Context

To build accurate parsers, we need HTML samples of each page type. Strategy:

1. **Save complete HTML** of each page type as `.html` fixtures in a `test/fixtures/` directory
2. Pages to capture:
   - `/news` (standard story list)
   - `/newest` (same layout, different data)
   - `/ask` (stories with text bodies)
   - `/show` (same as ask mostly)
   - `/jobs` (no vote arrows, no comment counts)
   - `/item?id=XXX` — story with comments (deep nesting)
   - `/item?id=XXX` — comment parent (shows context chain)
   - `/item?id=XXX` — Ask HN with text body and poll
   - `/newcomments`
   - `/threads?id=xxx`
   - `/user?id=xxx` (logged out)
   - `/user?id=xxx` (own profile, logged in)
   - `/favorites?id=xxx`
   - `/submitted?id=xxx`
   - `/submit` (logged in)
   - `/reply?id=xxx&goto=...` (reply page)
3. Write parsers against these fixtures
4. Use assertions to validate parsed output shapes

---

## 14. Decisions (Resolved)

1. **Shadow DOM CSS injection**: Inline all styles in the Vue build. Vite's lib mode with CSS inlined into the IIFE bundle. No external stylesheet references inside the shadow root.

2. **Passthrough page theming**: Re-render ALL pages including login/auth pages — same parse-then-render approach. No external API calls, just re-rendering the DOM content with modern styling.

3. **Icons**: Use [Lucide](https://lucide.dev/) icon set (tree-shakeable SVG icons). Install `lucide-vue-next` as a dependency.

4. **Comment reply UX**: Keep HN's native "navigate to separate reply page" behavior. The `/reply` page will be fully re-rendered (ReplyPage.vue) but the flow stays the same — no inline reply on item pages.

5. **Search**: Render the Algolia search link in the footer as a normal external link — no custom search UI.

---

## Appendix — Dependencies to Add

- `lucide-vue-next` — tree-shakeable SVG icon set (vote arrows, theme toggle, collapse/expand, flag, etc.)

### Fonts (bundled WOFF2, not CDN)

- **Atkinson Hyperlegible Next** — body text, comments, navigation
- **Inter** — story titles, headings, header bar
- **JetBrains Mono** — code blocks (fallback: Fira Mono, Consolas)

Fonts are downloaded as WOFF2 files into `src/assets/fonts/` and referenced via `@font-face` in `base.scss`. Vite's `assetsInlineLimit` can inline small fonts; larger ones are emitted as separate assets and injected into the shadow DOM via a `<style>` tag.

---

## Appendix — Original Brief
https://news.ycombinator.com/user?id=ewsbr