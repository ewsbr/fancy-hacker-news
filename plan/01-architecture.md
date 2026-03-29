# Architecture

## System Diagram

```
┌─────────────────────────────────────────────────────────┐
│  main.js (entry)                                        │
│  ├─ Hide original HN page                               │
│  ├─ Create document body host                              │
│  ├─ Mount Vue app                                       │
│  └─ Pass original document to parser layer              │
├─────────────────────────────────────────────────────────┤
│  Router (src/router/)                                   │
│  ├─ Reads location.pathname + search params             │
│  ├─ Returns a route descriptor { page, params }         │
│  └─ No navigation — purely declarative URL → page map   │
├─────────────────────────────────────────────────────────┤
│  Parsers (src/parsers/)                                 │
│  ├─ Each parser: (Document) → typed model interface     │
│  ├─ storyList.ts, item.ts, user.ts, submit.ts, etc.    │
│  └─ header.ts + shared utils.ts                         │
├─────────────────────────────────────────────────────────┤
│  Vue Components (src/content/)                          │
│  ├─ App.vue → resolves route, picks page component      │
│  ├─ layout/ (AppShell, SiteHeader, SiteFooter)          │
│  ├─ pages/ (StoriesPage, ItemPage, UserPage, etc.)      │
│  ├─ stories/, comments/, user/ (domain components)      │
│  ├─ shared/ (VoteButton, RichText, Pagination, etc.)    │
│  └─ forms/ (SubmitForm)                                 │
├─────────────────────────────────────────────────────────┤
│  Themes (src/styles/)                                   │
│  ├─ Tailwind CSS v4 with @theme directive              │
│  ├─ CSS custom properties on :host per theme            │
│  ├─ 4 themes: light, dark, nord, amoled                 │
│  └─ Persisted in chrome.storage.local                   │
├─────────────────────────────────────────────────────────┤
│  State (src/state/)                                     │
│  ├─ theme.ts (useTheme composable)                      │
│  └─ settings.ts (useSettings composable)                │
└─────────────────────────────────────────────────────────┘
```

## Entry Point Flow (`main.ts`)

```
1. Snapshot the original document (clone body or read from live DOM)
2. Parse header from original DOM
3. Resolve route via router
4. Call appropriate parser for the resolved page
5. Hide original HN DOM (display: none on body children)
6. Create document body host
7. Mount Vue app, passing parsed data as provide/inject
8. Vue renders the modern UI inside the root element
```

**Parse-then-render**: All parsing is synchronous before Vue mounts. If parsing fails, fall back to showing original HN.

## Data Flow

```
HN Server HTML → main.js (clone DOM → detect route → parse → hide orig → mount Vue)
                         ↓
                  App.vue + AppShell (receives parsed data via inject, picks page component)
                         ↓
                  Page Component → Sub-components (StoryRow, VoteButton, etc.)
                         ↓
                  <a href="..."> / <form action="..."> → HN Server (full page reload)
```

## Form Handling — No SPA, No Fetch

All state-changing actions use native HTML:

- **Vote:** `<a href="/vote?id=...&how=up&auth=...">` — GET link
- **Comment:** `<form method="POST" action="/comment">` with hidden `hmac`
- **Submit:** `<form method="POST" action="/r">` with hidden fields
- **Flag/Fave/Hide:** `<a href="/flag|fave|hide?id=...&auth=...">` — GET links

We preserve all CSRF tokens (`auth=` in links, `hmac` in forms) from the original DOM.

## File Structure

```
src/
├─ router/
│  └─ index.ts
├─ parsers/
│  ├─ header.ts
│  ├─ storyList.ts
│  ├─ item.ts
│  ├─ newComments.ts
│  ├─ user.ts
│  ├─ threads.ts
│  ├─ submit.ts
│  ├─ reply.ts
│  └─ utils.ts
├─ state/
│  ├─ theme.ts
│  └─ settings.ts
├─ content/
│  ├─ App.vue
│  ├─ main.js
│  ├─ layout/    (AppShell, SiteHeader, SiteFooter)
│  ├─ pages/     (StoriesPage, ItemPage, UserPage, etc.)
│  ├─ stories/   (StoryRow, StoryMeta, StoryDetail, StoryRank)
│  ├─ comments/  (CommentTree, CommentNode, CommentHeader, CommentBody, CommentForm, FlatComment)
│  ├─ user/      (UserProfile, UserLinks)
│  ├─ shared/    (VoteButton, RichText, Pagination, FlagButton, ThemeToggle)
│  └─ forms/     (SubmitForm)
├─ assets/
│  └─ fonts/     (*.woff2)
├─ styles/
│  └─ main.css              # @import "tailwindcss" + @theme + @font-face + theme CSS custom properties
└─ background/
   └─ background.js
```
