# Vue Components

## Component Hierarchy

```
App.vue
└─ AppShell.vue
   ├─ SiteHeader.vue
   │   ├─ Logo + nav links
   │   ├─ User controls (login/logout/karma)
   │   └─ ThemeToggle.vue
   ├─ <dynamic page component>
   │   ├─ StoriesPage.vue
   │   │   └─ StoryRow.vue (×N)
   │   │       ├─ StoryRank.vue
   │   │       ├─ VoteButton.vue
   │   │       └─ StoryMeta.vue
   │   ├─ ItemPage.vue
   │   │   ├─ StoryDetail.vue (story parent)
   │   │   │   ├─ VoteButton.vue
   │   │   │   ├─ RichText.vue
   │   │   │   └─ StoryMeta.vue
   │   │   ├─ CommentDetail.vue (comment parent)
   │   │   │   ├─ VoteButton.vue
   │   │   │   └─ RichText.vue
   │   │   ├─ CommentForm.vue
   │   │   └─ CommentTree.vue
   │   │       └─ CommentNode.vue (recursive)
   │   │           ├─ CommentHeader.vue
   │   │           ├─ CommentBody.vue → RichText.vue
   │   │           ├─ VoteButton.vue
   │   │           └─ CommentForm.vue
   │   ├─ UserPage.vue
   │   │   ├─ UserProfile.vue
   │   │   └─ UserLinks.vue
   │   ├─ NewCommentsPage.vue
   │   │   └─ FlatComment.vue (×N)
   │   ├─ ThreadsPage.vue
   │   │   └─ ThreadEntry.vue (×N)
   │   ├─ FavoritesPage.vue
   │   ├─ SubmitPage.vue → SubmitForm.vue
   │   ├─ ReplyPage.vue → RichText.vue + CommentForm.vue
   │   ├─ LoginPage.vue
   │   └─ StaticPage.vue
   ├─ SiteFooter.vue
   └─ Pagination.vue
```

---

## Component Specs

### `RichText.vue` — Safe HTML Renderer

- Renders HN-served HTML via `v-html`
- CSS for code blocks (`<pre><code>`)
- Styles `<p>` tags
- Detects blockquotes: `<p>` whose only child is `<i>` → styled as blockquote
- External links get `target="_blank"` + `rel="noopener noreferrer"`
- Internal HN links stay as normal navigation

### `VoteButton.vue`

- Renders ▲ (upvote) and optionally ▼ (downvote) via Lucide icons
- Clicking = standard GET request to vote URL (no JS fetch)
- States: unvoted, upvoted, downvoted
- Graceful when vote URLs absent (not logged in)

### `CommentNode.vue` — Recursive

- Renders header, body, actions
- Recursively renders `children`
- Collapsed: `[–]`/`[+]` toggle, hide body + children, show count
- Downvoted: `opacity-50` + expand on click
- Dead/flagged: `opacity-30`, badges
- Green username for new users (`text-new-user`)
- Indentation via Tailwind `ml-*` based on depth (not spacer gifs)

### `CommentForm.vue`

- `<form>` pointing at HN's native action URL
- Hidden fields: `hmac`, `parent`, `goto`
- `<textarea>` for text
- Native form POST (no JS fetch)
- Only shown when user is logged in (form data present)

### `LoginPage.vue`

- Parses existing auth form from HN DOM
- Renders modern styled form with same fields
- Native POST to HN endpoints
- Covers: login, changepw, forgot, comment-requires-login

### `StaticPage.vue`

- Extracts main content from HN DOM
- Renders inside themed shell via RichText
- Preserves all links and structure
- Covers: FAQ, guidelines, leaders, formatdoc, unknown routes

### `ThemeToggle.vue`

- Dropdown/cycle button for theme selection
- Uses `useTheme()` composable
- Lucide sun/moon/palette icons

---

## HN Hidden Features

| Feature | Detection | Rendering |
|---------|-----------|-----------|
| New user green name | `a.hnuser > font[color="#3c963c"]` | `text-new-user` |
| Downvoted fade | `div.commtext.cDD` or `.c5A` | `opacity-50` + expand button |
| Collapsible | `tr.coll` + `a.togg[n]` | `[–]` toggle, show `[N more]` |
| Dead comments | `[dead]` text in `span.comhead` | Dimmed, no vote arrow |
| Flagged comments | `[flagged]` text in `span.comhead` | `[flagged]` badge |
| Favorite | `a[href^="fave?"]` | Toggle link on item detail |
| Hide | `a.clicky.hider[href^="hide?"]` | Hide button in story meta |
| Past link | `a.hnpast` | "Past" link in story detail |
| Comment nav | `span.navs` | Root/parent/prev/next pill links |
| Story body | `div.toptext` non-empty | RichText below title |
| On-story context | `span.onstory` | "on: Title" for comment parents |
| Edit/delete | Edit/delete links if present | Render if parsed |
