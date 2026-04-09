# Fancy HackerNews

Fancy HackerNews is a Manifest V3 browser extension for Firefox and Chromium browsers that fully re-renders Hacker News with a cleaner, more readable interface while keeping Hacker News links, forms, and interaction flow intact.

## What It Does

- Replaces the default Hacker News layout with a custom Vue 3 UI
- Parses the original HN HTML directly from the page before rendering
- Keeps native links, forms, voting URLs, and CSRF tokens from Hacker News
- Supports story lists, item/comment threads, user pages, submission flows, login flows, lists, leaders, top colors, delete confirmation, static docs, and a dedicated 404 page for HN's `Unknown.` response
- Includes four local themes: `light`, `dark`, `nord`, and `amoled`
- Adds a built-in search entry point with a `Cmd/Ctrl+K` shortcut that opens Algolia search in a new tab

## How It Works

- The extension runs as a content script on `news.ycombinator.com`
- It reads the already-loaded HN DOM to build the initial page state instead of relying on a custom backend
- It mounts a Vue app into the page body and removes the original HN markup after first paint
- Native HN actions such as voting and flagging still go to Hacker News itself
- If parsing or rendering fails, the original Hacker News page remains visible

## Privacy / Data Handling

- No external service is used to load page content
- Voting and flagging requests go to Hacker News itself using the URLs already present in the page
- Search opens `hn.algolia.com` in a new tab only when you submit a query
- No account credentials are stored outside normal browser session handling
- Theme choice is stored locally in extension storage

## Permissions

- `storage`: used only to persist the selected theme

## Design Goals

- Keep Hacker News fast, linkable, and native
- Improve readability on desktop and mobile
- Preserve the original site's URLs, forms, and interaction model
- Avoid SPA behavior and avoid inventing new backend logic

## Supported Browsers

- Firefox 109+
- Chrome / Chromium 88+
- Edge 88+

## Known Quirks

- Hacker News can emit incorrect `prev` / `next` comment links for logged-out users when dead or deleted comments affect thread visibility. When logged in with dead/deleted comments shown, those links can differ.
- Hacker News returns HTTP 200 for missing pages and renders a literal `Unknown.` body. Fancy HackerNews detects that response and shows a dedicated 404 page.
