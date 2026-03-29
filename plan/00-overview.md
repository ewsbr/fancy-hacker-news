# HackerNews Modern UI — Plan Overview

A browser extension that fully re-renders every HackerNews page with a modern Vue-based UI inside a document body. Uses Tailwind CSS for styling. No SPA routing, no fetch calls — all interactions use native HTML forms and links.

## Plan Files

| File | Contents |
|------|----------|
| [01-architecture.md](01-architecture.md) | High-level architecture, data flow, entry point |
| [02-router.md](02-router.md) | URL → page resolver, full route table |
| [03-parsers.md](03-parsers.md) | DOM parsers with exact selectors and data models |
| [04-components.md](04-components.md) | Vue component hierarchy and specs |
| [05-themes.md](05-themes.md) | Tailwind CSS config, fonts, 4 theme token maps, useTheme composable |
| [06-checklist.md](06-checklist.md) | Implementation checklist (actionable tasks) |

## Key Decisions

1. **CSS**: Tailwind CSS with custom theme tokens. All styles inlined in the IIFE build (no external sheets in document body)
2. **Pages**: ALL pages re-rendered (no passthrough) — including login, FAQ, etc.
3. **Icons**: Lucide via `lucide-vue-next`
4. **Fonts**: Atkinson Hyperlegible Next (body), Inter (titles), JetBrains Mono (code) — bundled WOFF2
5. **Reply UX**: Same flow as original HN (navigate to `/reply` page)
6. **Search**: Algolia link in footer as external passthrough
7. **Forms**: Native POST/GET — preserve HN's CSRF tokens, no JS fetch
8. **Themes**: Light, Dark, Nord, AMOLED Black — via Tailwind CSS custom properties
