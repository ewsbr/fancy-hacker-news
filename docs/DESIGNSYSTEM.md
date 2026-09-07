# Design System

Shared UI principles for Fancy Hacker News. Exact values belong in styles and components; this guide records the conventions that should stay consistent across pages.

## Principles

- Preserve Hacker News semantics and native links, forms, and actions.
- Balance density and readability. Favor readability on small screens.
- Reuse shared components, typography, spacing, and theme tokens.
- Keep controls lightweight, recognizable, and accessible by keyboard and touch.

## Layout and Responsiveness

- Use readable content widths and let layouts adapt to available space.
- Respect the selected content width through `--fhn-content-max-width`; presets live in [settings.ts](../src/state/settings.ts).
- Prefer flexible wrapping and existing responsive conventions over new component-specific breakpoints. See [AGENTS.md](../AGENTS.md#responsive-rules) for project defaults.
- On small screens, reduce surrounding chrome and give content and controls room to breathe.
- Keep related content in one surface. Use attached pagination when `More` continues the same card or list; use standalone pagination for a separate surface.
- Keep wrapped metadata and action groups visually distinct, without orphaned separators.

## Typography and Spacing

- Use the shared font roles in [main.scss](../src/styles/main.scss): body text for reading, title text for headings, and monospace for code and compact accents.
- Keep metadata legible and consistent across story and comment views. Adapt mobile density through spacing and hit areas before shrinking text.
- Keep badges secondary to titles and consistent across views.
- Use `rem` for typography and `px` for layout so larger text does not inflate the page scaffolding.

## Themes

- Use the semantic tokens in [_theme-tokens.scss](../src/styles/_theme-tokens.scss) for colors and shadows. Prefer existing tokens over local color derivations.
- Keep text, controls, focus states, and loading indicators clear in every theme.
- Keep extension styling scoped to `#fancy-hn-root`, with component styles in scoped SCSS.

## Interaction

- Reuse shared controls for pagination, search, metadata separators, and inline actions.
- Use `reka-ui` for dialogs, menus, tooltips, and other focus-managed controls.
- Give small icons generous hit areas without crowding adjacent controls.
- Make hover, focus, active, and busy states clear without shifting layout. Respect reduced-motion preferences.
- Keep comment navigation distinct from vote, reply, and edit actions.
- Preserve browser search, text selection, and stable navigation in long comment threads.
- Keep loading feedback unobtrusive. When positioning an initial comment target requires a cover, keep site navigation and modal close controls available.

Update this guide when shared UI conventions change. Record constraints and rationale; leave component-specific values in code.
