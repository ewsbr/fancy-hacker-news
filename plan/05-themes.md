# Theme System & Fonts

## Styling Approach: Tailwind CSS v4

All components use **Tailwind utility classes** for layout, spacing, typography, and color. Theme colors are referenced via custom color utilities that map to CSS custom properties (e.g. `bg-surface`, `text-muted`, `border-border`).

Tailwind v4 uses a **CSS-first configuration** approach:
- No `tailwind.config.js` — all config is in CSS via `@theme` directive
- No `@tailwind` directives — use `@import "tailwindcss"`
- No Sass/SCSS — Tailwind v4 is incompatible with preprocessors
- Vite plugin: `@tailwindcss/vite` (not PostCSS plugin)
- Custom utilities: `@utility` directive (not `@layer utilities`)

Tailwind is assumed to be already set up and working inside the document body.

---

## Fonts (Bundled WOFF2)

| Font | Usage | Fallback |
|------|-------|----------|
| **Atkinson Hyperlegible Next** | Body text, comments, nav, meta | `system-ui, sans-serif` |
| **Inter** | Story titles, headings, header bar | `system-ui, sans-serif` |
| **JetBrains Mono** | Code blocks | `Fira Mono, Consolas, monospace` |

Fonts live in `src/assets/fonts/` as WOFF2 files. Loaded via `@font-face` in `main.css`.

### Tailwind Theme Config (in CSS via `@theme`)

In Tailwind v4, custom values are defined directly in CSS:

```css
/* main.css */
@import "tailwindcss";

@theme {
  --font-body: "Atkinson Hyperlegible Next", system-ui, sans-serif;
  --font-title: "Inter", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", "Fira Mono", Consolas, monospace;

  /* Custom colors mapped to CSS custom properties */
  --color-bg: var(--color-bg);
  --color-surface: var(--color-surface);
  --color-accent: var(--color-accent);
  --color-text: var(--color-text);
  --color-muted: var(--color-text-muted);
  --color-border: var(--color-border);
  --color-code-bg: var(--color-code-bg);
  --color-quote-border: var(--color-quote-border);
  --color-downvoted: var(--color-downvoted);
  --color-new-user: var(--color-new-user);
}
```

Usage: `font-body`, `font-title`, `font-mono`, `bg-bg`, `text-accent`, `text-muted`, `border-border`, etc.

---

## Themes

4 themes, switched via `data-theme` attribute on the root element host element.

### Theme Tokens (CSS Custom Properties)

Each theme defines these CSS custom properties. Tailwind is configured to reference them.

```css
/* Default: Light */
:host {
  --color-bg:           #f6f6ef;
  --color-surface:      #ffffff;
  --color-accent:       #ff6600;
  --color-text:         #1a1a1a;
  --color-text-muted:   #828282;
  --color-border:       #e0e0e0;
  --color-code-bg:      #f5f5f5;
  --color-quote-border: #ff6600;
  --color-downvoted:    #b0b0b0;
  --color-new-user:     #3c963c;
}

/* Dark */
:host[data-theme="dark"] {
  --color-bg:           #1a1a1a;
  --color-surface:      #2d2d2d;
  --color-accent:       #ff7733;
  --color-text:         #e0e0e0;
  --color-text-muted:   #999999;
  --color-border:       #404040;
  --color-code-bg:      #2a2a2a;
  --color-quote-border: #ff7733;
  --color-downvoted:    #666666;
  --color-new-user:     #5cb85c;
}

/* Nord */
:host[data-theme="nord"] {
  --color-bg:           #2e3440;
  --color-surface:      #3b4252;
  --color-accent:       #88c0d0;
  --color-text:         #eceff4;
  --color-text-muted:   #a0a8b7;
  --color-border:       #4c566a;
  --color-code-bg:      #3b4252;
  --color-quote-border: #88c0d0;
  --color-downvoted:    #616e88;
  --color-new-user:     #a3be8c;
}

/* AMOLED Black */
:host[data-theme="amoled"] {
  --color-bg:           #000000;
  --color-surface:      #111111;
  --color-accent:       #ff6600;
  --color-text:         #e0e0e0;
  --color-text-muted:   #777777;
  --color-border:       #222222;
  --color-code-bg:      #0a0a0a;
  --color-quote-border: #ff6600;
  --color-downvoted:    #555555;
  --color-new-user:     #5cb85c;
}
```

### Tailwind Color Config (in CSS via `@theme`)

Colors are already defined in the `@theme` block above, referencing the CSS custom properties set on `:host`. No JS config file needed.

Usage examples:
- `bg-bg` — page background
- `bg-surface` — card/content background
- `text-accent` — accent-colored text (HN orange)
- `text-muted` — secondary/meta text
- `border-border` — borders
- `bg-code-bg` — code block background
- `text-new-user` — green new-user name
- `text-downvoted` — downvoted comment text

---

## `useTheme()` Composable

**Location:** `src/state/theme.ts`

```ts
useTheme(): {
  theme: Ref<'light' | 'dark' | 'nord' | 'amoled'>
  setTheme(name: 'light' | 'dark' | 'nord' | 'amoled'): void
  cycleTheme(): void
}
```

- Reads initial preference from `chrome.storage.local`
- Falls back to system `prefers-color-scheme: dark` → `'dark'`, else `'light'`
- Persists changes to `chrome.storage.local`
- Sets `data-theme` attribute on the root host element

---

## Rich Content CSS

These are the few places where we use custom CSS beyond Tailwind utilities (in `main.css` or scoped component styles).

### Code Blocks

```css
@utility rich-text-pre {
  @apply bg-code-bg rounded-sm px-4 py-3 overflow-x-auto font-mono text-sm leading-relaxed;
}
```

### Quotes

```css
@utility rich-text-quote {
  @apply border-l-[3px] border-quote-border pl-4 text-muted italic my-2;
}
```

### Links

External links in RichText get `target="_blank"` + `rel="noopener noreferrer"` via JS processing. Styled with `text-accent hover:underline`.
