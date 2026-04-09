# Design System

This file is the working UI contract for Fancy HackerNews. Use it to keep layout, typography, spacing, and interaction behavior consistent across pages and components.

## Principles

- Preserve Hacker News semantics, but not its visual density
- Prefer readability over compactness, especially on mobile
- Keep interactions native-looking and obvious
- Avoid adding one-off breakpoints or component-local visual systems unless there is a strong reason
- Reuse the same spacing and typography rhythm across story, comment, and form surfaces

## Breakpoints

### Canonical

- `max-width: 640px`
  Primary mobile breakpoint. This is the default responsive cutoff for content density, tap targets, card edge treatment, comment metadata scaling, and compact layouts.

- `min-width: 641px`
  Desktop counterpart when a component needs an explicit non-mobile branch.

### Secondary Layout Breakpoints

- `max-width: 768px`
  Navigation and medium-layout collapse point. Used for header/mobile nav and some footer stacking.

- `min-width: 768px`
  Sidebar / two-column layouts begin here, especially on the user page.

### Existing Legacy / Component-Specific Breakpoints

- `max-width: 980px`
  Footer large-layout collapse
- `max-width: 720px`
  Footer grid reduction
- `max-width: 480px`
  Small form-field layout adjustments on the user page
- `max-width: 380px`
  Very narrow footer fallback

### Standardization Rule

- Default to `640px` for mobile behavior
- Default to `768px` for medium / navigation / sidebar layout changes
- Do not introduce new breakpoints unless the current component already uses one or the layout genuinely cannot be expressed with `640` and `768`
- When touching older footer or profile code, prefer consolidating toward the existing values above rather than adding more

## Typography

Defined in [main.scss](/home/ews/WebstormProjects/hackernews/src/styles/main.scss).

- Body font: `Atkinson Hyperlegible Next Variable`
- Title/display font: `Manrope Variable`
- Mono font: `JetBrains Mono Variable`

### Type Roles

- Body copy uses the body font with strong legibility and moderate line height
- Story titles and section headers use the title font
- Badges, toggles, ranks, and compact metadata accents often use mono styling or high-weight uppercase treatment

### Mobile Typography Direction

- Mobile metadata rows should be slightly larger than desktop when they contain tap interactions
- Small interactive glyph clusters such as `< # >` should have larger hit areas without visually bloating their container
- Story title, story site badge, and story meta should scale together on mobile

## Color Tokens

Defined as CSS custom properties on `#fancy-hn-root` and theme variants in [main.scss](/home/ews/WebstormProjects/hackernews/src/styles/main.scss).

Core tokens:

- `--color-bg`
- `--color-surface`
- `--color-accent`
- `--color-text`
- `--color-text-muted`
- `--color-border`
- `--color-divider`
- `--color-code-bg`
- `--color-quote-border`
- `--color-quote-bg`
- `--color-downvoted`
- `--color-new-user`
- `--color-accent-muted`
- `--shadow-elevation`

Themes:

- `light`
- `dark`
- `nord`
- `amoled`

## Layout

### Root Shell

- Main app width is typically capped around `1024px`
- Shared content surfaces use `.hn-content-card`
- On mobile, cards usually lose side borders and corner radius to align flush with the viewport
- When a `More` footer continues the same list surface, keep it inside that card shell with the attached pagination treatment instead of rendering a second bordered box below it

### Common Page Widths

- General content shell: `1024px`
- User page: `800px`
- Search modal: `560px`
- Static/format pages: about `48rem`
- Leaders/list pages: narrower fixed reading widths where appropriate

## Spacing

### General

- Desktop metadata rows tend to use tight gaps
- Mobile metadata rows should open up slightly in both `column-gap` and `row-gap`
- Action rows should not visually collide with metadata rows; if they wrap, they should read as a second line rather than a continuation error

### Separator Rule

- `MetaSep` is the standard inline separator
- Do not allow orphaned separators at the beginning of wrapped mobile action rows
- If an action cluster wraps on mobile, prefer hiding separators and using flex gap instead

## Components

### Story Header

- Title, site badge, badges, and metadata should feel like one system
- On mobile, enlarge:
  - story title
  - site/domain badge
  - metadata text
  - spacing between metadata and action items
- Story action rows on mobile should sit slightly lower than the score/byline line when wrapped

### Pagination

- `Pagination` is the standard `More` footer treatment
- Use the standalone variant when it is visually separate from the content above
- Use the attached variant when it continues the same card/list surface so the footer reads as one connected component with the rows above it
- Avoid stacking two fully bordered cards just to place `More` below a list

### Comment Metadata

- Desktop can be dense
- Item comments and thread comments should use the same header layout and sizing rules
- The collapse toggle should center within a single metadata row but remain top-aligned when the metadata wraps to two rows
- Mobile metadata rows should be larger overall because they carry tapping interactions
- Trailing icon controls should be rendered last
- For mobile, compact icon clusters are acceptable; long text navigation links are not
- Mobile comment action rows should also scale up primary actions like upvote and reply with larger text and larger invisible hit targets

### Comment Navigation

- `latest`, `root`, `parent`, and `context` are text-style metadata links when shown
- `prev`, permalink `#`, and `next` are compact icon controls when rendered in the metadata tail
- Mobile should prefer the compact control cluster over repeating long nav labels in the action row
- Do not place comment navigation links next to vote/reply/edit action groups

### Hit Areas

- Small controls should use enlarged invisible hit targets
- Increase tap area first; increase visual footprint only when necessary
- This is especially important for vote controls, fragment/permalink buttons, and compact nav arrows

## Interaction Patterns

- Native links and forms are preferred over custom client navigation
- Inline controls should feel lightweight, not button-heavy
- Pill-styled controls are acceptable sparingly; avoid placing multiple competing pill/button treatments in the same short action row
- `SearchTrigger` is the standard search entry control; when it sits beside nearby navigation, the surrounding actions should usually be lighter inline links rather than a second competing pill/button
- Hover/focus states generally shift toward `--color-accent` or full text color
- Busy/active states should rely on opacity and accent color, not layout movement

## Parser / UI Responsibility Boundary

- Parsers should extract HN data faithfully
- UI should interpret and present that data clearly
- If HN itself emits inconsistent or buggy navigation markup, do not assume the extension should “correct” it unless there is a clear product decision to diverge

## Documentation Rule For Future Changes

If you change any of the following, update this file in the same task:

- responsive breakpoints
- typography scale
- mobile metadata sizing
- standard action-row behavior
- badge styles
- shared interaction hit-area rules
