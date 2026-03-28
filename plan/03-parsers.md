# DOM Parsers

**Location:** `src/parsers/`

Each parser is a pure function: `(doc: Document) → ParsedModel`

Parsers run on the **original HN DOM** before Vue replaces it.

## DOM Conventions

- Outer shell: `body > center > table#hnmain`
- `html[op]` attribute: `"news"`, `"item"`, etc.
- Vote/hide/fave/logout = **GET links** with `auth=` token
- Comment/submit = **POST forms** with `hmac` hidden field
- New-user indicator: `<font color="#3c963c">` inside `a.hnuser`
- Comment body state: `div.commtext.c00` (normal), `.c5A` (mid-grey), `.cDD` (dead)
- Collapsed: `tr.athing.comtr.coll` + `.nosee` on vote cell + `.noshow` on body
- Dead/flagged: literal `[dead]`/`[flagged]` text in `span.comhead`
- Indentation: `td.ind[indent="N"]` (0-based depth)

---

## `header.ts` — Site Header

**Selectors:**
- Nav links: first `span.pagetop` → `b.hnname > a` + sibling `a` elements
- Username: `a#me[href^="user?id="]`
- Karma: `span#karma`
- Logout: `a#logout[href^="logout?auth="]`

```ts
parseHeader(doc: Document): ParsedHeader

interface ParsedHeader {
  navLinks: NavLink[]
  user: HeaderUser | null
  logoutUrl: string | null
}

interface NavLink { label: string; href: string; active: boolean }
interface HeaderUser { name: string; karma: number }
```

---

## `storyList.ts` — Story Lists

Used for: `/news`, `/newest`, `/front`, `/ask`, `/show`, `/jobs`, `/best`, `/active`, `/noobstories`, `/submitted`, `/upvoted`, `/favorites`, `/hidden`

Each story = **3 `<tr>`**: `tr.athing.submission` + subtext `<tr>` + `tr.spacer`

**Selectors per story:**
| Field | Selector |
|-------|----------|
| Story id | `tr.athing.submission[id]` |
| Rank | `td.title > span.rank` |
| Vote link | `a#up_<id>.clicky[href^="vote?"]` |
| Title + URL | `span.titleline > a` (first child) |
| Site domain | `span.sitebit.comhead > a > span.sitestr` |
| Score | `span.score#score_<id>` |
| Author | `a.hnuser` (child `<font color="#3c963c">` = new user) |
| Age text | `span.age > a` |
| Timestamp | `span.age[title]` |
| Hide link | `a.clicky.hider[href^="hide?"]` |
| Comment link | last `a[href^="item?id="]` in `.subline` |

```ts
parseStoryList(doc: Document): ParsedStoryList

interface ParsedStoryList {
  stories: Story[]
  moreLink: string | null
  startRank: number
}

interface Story {
  id: string
  rank: number
  title: string
  url: string | null
  site: string | null
  score: number | null
  author: string | null
  authorIsNew: boolean
  age: string
  ageTimestamp: string
  ageLink: string
  commentCount: number | null
  commentLink: string | null
  isJob: boolean
  hideUrl: string | null
  voteUp: string | null
  voteUn: string | null
}
```

---

## `item.ts` — Item Page (Story + Comments)

**Structure differs by parent type:**
- **Story parent:** `table.fatitem` → `tr.athing.submission` + subtext + `div.toptext` (body) + comment form
- **Comment parent:** `table.fatitem` → `tr.athing` with `span.comhead`, `div.commtext`, `span.onstory`

**Comment tree:** `table.comment-tree` → flat `tr.athing.comtr` rows

```ts
parseItemPage(doc: Document): ParsedItemPage

interface ParsedItemPage {
  item: ItemDetail
  comments: CommentNode[]
  replyForm: ReplyForm | null
}

interface ItemDetail {
  id: string
  type: 'story' | 'comment'
  title: string | null
  url: string | null
  site: string | null
  score: number | null
  author: string
  authorIsNew: boolean
  age: string
  ageTimestamp: string
  ageLink: string
  bodyHtml: string | null
  parentLink: string | null
  contextLink: string | null
  storyTitle: string | null
  storyLink: string | null
  voteUp: string | null
  voteDown: string | null
  voteUn: string | null
  hideUrl: string | null
  pastUrl: string | null
  favoriteUrl: string | null
  flagUrl: string | null
}

interface ReplyForm {
  action: string
  hmac: string
  parentId: string
  gotoUrl: string
  submitLabel: string
}
```

### CommentNode

**Selectors per `tr.athing.comtr#<id>`:**
| Field | Selector |
|-------|----------|
| Indent | `td.ind[indent]` |
| Vote | `td.votelinks a#up_<id>.clicky` |
| Author | `span.comhead > a.hnuser` |
| New user | `a.hnuser > font[color="#3c963c"]` |
| Age | `span.comhead > span.age > a` |
| Timestamp | `span.age[title]` |
| Dead/flagged | `[dead]`/`[flagged]` text nodes in `span.comhead` |
| Nav links | `span.navs` (root/parent/prev/next/context) |
| Collapse | `a.togg.clicky[n]` |
| Body | `div.comment > div.commtext` (class: `.c00`/`.c5A`/`.cDD`) |
| Reply | `div.reply a[href^="reply?"]` |
| Collapsed | `tr.athing.comtr.coll` |

```ts
interface CommentNode {
  id: string
  author: string
  authorIsNew: boolean
  age: string
  ageTimestamp: string
  ageLink: string
  bodyHtml: string
  bodyClass: 'c00' | 'c5A' | 'cDD'
  indent: number
  isCollapsed: boolean
  isDead: boolean
  isFlagged: boolean
  isDownvoted: boolean
  collapsedCount: number
  voteUp: string | null
  voteDown: string | null
  voteUn: string | null
  flagUrl: string | null
  replyLink: string | null
  navLinks: {
    root: string | null
    parent: string | null
    prev: string | null
    next: string | null
    context: string | null
  }
  children: CommentNode[]
}
```

### Comment Tree Building

1. Iterate `tr.athing.comtr` rows in order
2. Read depth from `td.ind[indent]` attribute (integer)
3. Maintain a stack tracking current parent at each depth
4. Push each comment as child of the parent at `depth - 1`

---

## `newComments.ts` — New/Noob Comments

Flat list of comments with story context links.

```ts
parseNewComments(doc: Document): ParsedNewComments

interface ParsedNewComments {
  comments: FlatComment[]
  moreLink: string | null
}

interface FlatComment {
  id: string
  author: string
  authorIsNew: boolean
  age: string
  ageLink: string
  bodyHtml: string
  onStory: { title: string; link: string }
  voteUp: string | null
  voteDown: string | null
  voteUn: string | null
}
```

---

## `user.ts` — User Profile

**Selectors:**
- Form: `form.profileform[action="/xuser"]`
- Username: `a.hnuser`
- Created: `a[href^="front?day="]`
- About: `textarea[name="about"]`
- Email: `input[name="email"]`
- Preferences: `select[name="showd"]`, `select[name="nopro"]`, `input[name="maxv"]`, `input[name="mina"]`, `input[name="delay"]`
- Hidden fields: `input[name="id"]`, `input[name="hmac"]`

```ts
parseUserPage(doc: Document): ParsedUserPage

interface ParsedUserPage {
  username: string
  created: string
  createdLink: string
  karma: number
  about: string | null
  email: string | null
  isOwnProfile: boolean
  preferences: {
    showDead: string | null
    noprocrast: string | null
    maxVisit: string | null
    minAway: string | null
    delay: string | null
  } | null
  editForm: {
    action: string
    hmac: string
    userId: string
  } | null
  changePwLink: string | null
  submissionsLink: string
  threadsLink: string
  upvotedLink: string | null
  upvotedCommentsLink: string | null
  favoritesLink: string
  favoritesCommentsLink: string | null
}
```

---

## `threads.ts` — Threads Page

```ts
parseThreadsPage(doc: Document): ParsedThreadsPage

interface ParsedThreadsPage {
  username: string
  threads: ThreadEntry[]
  moreLink: string | null
}

type ThreadEntry = CommentNode & {
  onStory: { title: string; link: string } | null
}
```

---

## `submit.ts` — Submit Page

```ts
parseSubmitPage(doc: Document): ParsedSubmitPage

interface ParsedSubmitPage {
  form: {
    action: string
    fnid: string
    fnop: string
    fields: { name: string; value: string; type: string }[]
  }
}
```

---

## `reply.ts` — Reply Page

```ts
parseReplyPage(doc: Document): ParsedReplyPage

interface ParsedReplyPage {
  parent: {
    author: string
    age: string
    bodyHtml: string
  }
  replyForm: {
    action: string
    hmac: string
    parentId: string
    gotoUrl: string
  }
}
```

---

## `utils.ts` — Shared Helpers

Utility functions used across parsers:
- `textOf(el)` — safe `textContent?.trim()`
- `attrOf(el, name)` — safe `getAttribute`
- `hrefOf(el)` — extract `href`
- `parseScore(text)` — "123 points" → `123`
- `parseCommentCount(text)` — "45 comments" → `45`, "discuss" → `0`
- `isNewUser(hnuserEl)` — checks for `<font color="#3c963c">`
- `parseAge(ageSpan)` — extract text + timestamp from `span.age`
- `findMoreLink(doc)` — find `a.morelink[href]` or `a[rel="next"]`
