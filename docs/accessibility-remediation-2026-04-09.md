# Accessibility Remediation Notes - 2026-04-09

This document explains the accessibility and related production fixes implemented after the audit in [docs/accessibility-audit-2026-04-09.md](../docs/accessibility-audit-2026-04-09.md).

Scope:
- Fix the P1 issues from the audit.
- Fix the P2 issues from the audit.
- Keep the visible More pagination label, but add an accessible label.

## 1. Search trigger label-in-name mismatch

Why this changed:
- The search button exposed Search Hacker News as its accessible name while the visible label was Search HN.
- That is a label-in-name problem for assistive tech and voice-control users.

What changed:
- Removed the overriding accessible name from the button.
- Hid the keyboard shortcut hint from the computed accessible name so the visible text can serve as the button label cleanly.

Files changed:
- [src/content/ui/modals/SearchTrigger.vue](../src/content/ui/modals/SearchTrigger.vue)

## 2. Theme toggle label-in-name mismatch

Why this changed:
- The theme toggle exposed Change theme as the accessible name while the visible label was the active theme name, such as Dark.

What changed:
- Updated the trigger so its accessible name includes the visible active theme label and still communicates the control purpose.

Files changed:
- [src/content/ui/shell/ThemeToggle.vue](../src/content/ui/shell/ThemeToggle.vue)

## 3. Story metadata touch targets on mobile

Why this changed:
- Lighthouse flagged the author and age links in story metadata as too small and too tightly packed on mobile.

What changed:
- Increased the interactive box size for author and age links.
- Added matching touch-target treatment for story metadata links on small screens.
- Slightly increased the spacing between the title line and metadata row on mobile.

Files changed:
- [src/content/ui/composites/AuthorByline.vue](../src/content/ui/composites/AuthorByline.vue)
- [src/content/stories/StoryMeta.vue](../src/content/stories/StoryMeta.vue)
- [src/content/stories/StoryRow.vue](../src/content/stories/StoryRow.vue)

## 4. Footer and footer-search contrast in dark themes

Why this changed:
- Footer disclaimer text, footer metadata, and the footer search placeholder were over-muted in dark surfaces.
- The main problem was stacking opacity reductions on text that was already using muted colors.

What changed:
- Removed the extra opacity reductions from the footer disclaimer and footer metadata.
- Removed the extra placeholder opacity from the search trigger.
- Kept the light-mode footer disclaimer override muted by using a direct theme token instead of a brighter custom color.

Files changed:
- [src/content/layout/SiteFooter.vue](../src/content/layout/SiteFooter.vue)
- [src/content/ui/modals/SearchTrigger.vue](../src/content/ui/modals/SearchTrigger.vue)

## 5. Dialog and popover focus management

Why this changed:
- Search, sub-thread, and theme-picker overlays did not fully manage keyboard focus.
- That created a risk that Tab could escape the open surface, and focus was not reliably restored when the surface closed.

What changed:
- Added a shared focus utility for focus trapping and focus restoration.
- Search modal now traps Tab within the dialog and restores focus on close.
- Sub-thread modal now traps Tab, moves initial focus to the close button, and restores focus on close.
- Theme picker now moves focus into the open popover, traps Tab while open, closes on Escape, and restores focus to the trigger.

Files changed:
- [src/content/utils/focusTrap.ts](../src/content/utils/focusTrap.ts)
- [src/content/ui/modals/SearchModal.vue](../src/content/ui/modals/SearchModal.vue)
- [src/content/comments/SubThreadModal.vue](../src/content/comments/SubThreadModal.vue)
- [src/content/ui/shell/ThemeToggle.vue](../src/content/ui/shell/ThemeToggle.vue)

## 6. Production font 404s

Why this changed:
- Lighthouse reported font requests failing against the host page origin.
- Content-script stylesheet font URLs were still resolving against the page origin during real audits.

What changed:
- Removed the raw font imports from the stylesheet and content entry.
- Added a runtime font loader that injects explicit @font-face rules using emitted asset URLs.
- Reduced the deferred font set to the English subsets actually needed for the current product surface.
- Primed those fonts before the extension UI mounts so the page does not visibly swap from system text into the custom faces after render.

Files changed:
- [src/content/main.ts](../src/content/main.ts)
- [src/styles/main.scss](../src/styles/main.scss)
- [src/content/utils/loadExtensionFonts.ts](../src/content/utils/loadExtensionFonts.ts)

## 7. Pagination accessible label

Why this changed:
- The visible More text was intentionally kept, but the link needed extra spoken context.

What changed:
- Added an accessible label that preserves the visible More wording and clarifies that the link moves to the next page.

Files changed:
- [src/content/ui/primitives/Pagination.vue](../src/content/ui/primitives/Pagination.vue)

## Validation

- Typecheck passed.
- Tests passed: 12 files, 52 tests.
- Build passed.

## Remaining verification

- Lighthouse has not been rerun after these changes.
- A live keyboard-only pass and a screen-reader pass are still recommended.