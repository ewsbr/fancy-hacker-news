# Fancy HackerNews

Fancy HackerNews is a Manifest V3 browser extension for Firefox and Chromium browsers that fully re-renders Hacker News with a cleaner, more readable interface while keeping the original HN behavior intact.

## What It Does

- Replaces the default Hacker News layout with a custom Vue 3 UI
- Parses the original HN HTML directly from the page before rendering
- Keeps native links, forms, voting URLs, and CSRF tokens from Hacker News
- Supports story pages, comment threads, user pages, submission forms, login flows, lists, leaders, and static docs
- Offers four local themes: `light`, `dark`, `nord`, and `amoled`

## How It Works

- The extension runs as a content script on `news.ycombinator.com`
- It reads the already-loaded HN DOM instead of calling the official API or any third-party service
- It mounts a Vue app into the page body and removes the original HN markup after first paint
- If parsing or rendering fails, the original Hacker News page remains visible

## Privacy / Data Handling

- No API calls for page content
- No scraping through external services
- No account credentials stored outside normal browser session handling
- Theme choice is stored locally in extension storage

## Permissions

- `storage`: used only to persist the selected theme

## Design Goals

- Keep Hacker News fast, linkable, and native
- Improve readability on desktop and mobile
- Preserve the original site’s URLs, forms, and interaction model
- Avoid SPA behavior and avoid inventing new backend logic

## Supported Browsers

- Firefox 109+
- Chrome / Chromium 88+
- Edge 88+

## Known Quirks

- Hacker News can emit incorrect `prev` / `next` comment links for logged-out users when dead or deleted comments affect thread visibility. When logged in with dead/deleted comments shown, those links can differ.
