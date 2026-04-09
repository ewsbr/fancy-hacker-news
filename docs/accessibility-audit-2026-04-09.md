# Accessibility Audit - 2026-04-09

Scope: Fancy HackerNews content-script UI rendered over the Hacker News homepage on mobile, based on [lighthouse.json](../lighthouse.json) plus targeted code review.

Method:
- Reviewed the failing Lighthouse accessibility and best-practices audits in [lighthouse.json](../lighthouse.json).
- Mapped the failing nodes back to extension-owned Vue and SCSS sources.
- Performed a limited code review for manual-audit risks around dialog and keyboard behavior.

Limits:
- No manual screen-reader pass was run.
- No keyboard-only interaction pass was run end to end.
- Host-page concerns owned by news.ycombinator.com are separated below.

## Priority Summary

### P1 - Fix next

- [ ] Accessible names do not match visible labels on key controls.
- [ ] Story metadata links are too small for mobile touch targets.
- [ ] Dark and AMOLED footer/search text fails contrast requirements.

### P2 - Fix soon

- [ ] Dialog and popover focus management is incomplete.
- [ ] Font assets are 404ing in production.

### P3 - Nice to clean up

- [ ] Pagination link text is too generic.

## Findings

### P1. Accessible names do not match visible labels

Impact:
- Breaks WCAG 2.5.3 Label in Name.
- Voice-control users may not be able to activate controls using the text they can see.
- Screen-reader output is less predictable than the visual UI.

Evidence:
- Search trigger uses an explicit accessible name that does not include the visible label: [src/content/ui/modals/SearchTrigger.vue](../src/content/ui/modals/SearchTrigger.vue#L19) and [src/content/ui/modals/SearchTrigger.vue](../src/content/ui/modals/SearchTrigger.vue#L23).
- Theme trigger exposes Change theme while the visible label is the active theme name, such as Dark: [src/content/ui/shell/ThemeToggle.vue](../src/content/ui/shell/ThemeToggle.vue#L42) and [src/content/ui/shell/ThemeToggle.vue](../src/content/ui/shell/ThemeToggle.vue#L50).

Suggested fix:
- Make the accessible name include the visible text exactly.
- For the search trigger, prefer a name that starts with Search HN and can optionally add more context after it.
- For the theme trigger, either remove the overriding label or switch to an accessible name that includes the visible theme label plus the control purpose.

Definition of done:
- Lighthouse no longer reports label-content-name-mismatch.
- A user can activate these controls by speaking the visible label.

### P1. Story metadata links are too small on mobile

Impact:
- Mobile users have reduced touch accuracy on author and age links.
- Fails the Lighthouse target-size audit on the main story list.

Evidence:
- The metadata row is intentionally compact: [src/content/stories/StoryMeta.vue](../src/content/stories/StoryMeta.vue#L53) and [src/content/stories/StoryMeta.vue](../src/content/stories/StoryMeta.vue#L56).
- Author and age links remain plain inline links inside an inline metadata construct: [src/content/ui/composites/AuthorByline.vue](../src/content/ui/composites/AuthorByline.vue#L19), [src/content/ui/composites/AuthorByline.vue](../src/content/ui/composites/AuthorByline.vue#L26), and [src/content/ui/composites/AuthorByline.vue](../src/content/ui/composites/AuthorByline.vue#L32).
- The comments link already gets extra hit-area expansion, which highlights the missing treatment on neighboring links: [src/content/stories/StoryMeta.vue](../src/content/stories/StoryMeta.vue#L82) and [src/content/stories/StoryMeta.vue](../src/content/stories/StoryMeta.vue#L90).

Suggested fix:
- Increase hit areas for author and age links on small screens.
- Prefer inline-flex links with minimum block size and horizontal padding over relying on tight inline text.
- Re-check spacing so neighboring links still preserve distinct tap targets.

Definition of done:
- Lighthouse no longer reports target-size failures for story metadata links.
- Author, age, and comments links all meet the same mobile tap-target treatment.

### P1. Dark and AMOLED footer/search text fails contrast

Impact:
- Footer disclaimers and metadata are hard to read in dark themes.
- Search placeholder text in the footer drops below accessible contrast.

Evidence:
- Footer disclaimer copy is in [src/content/layout/SiteFooter.vue](../src/content/layout/SiteFooter.vue#L101).
- Footer metadata styling is muted further with opacity: [src/content/layout/SiteFooter.vue](../src/content/layout/SiteFooter.vue#L194) and [src/content/layout/SiteFooter.vue](../src/content/layout/SiteFooter.vue#L360).
- Search trigger text and placeholder both rely on muted text styling, with the placeholder reduced again via opacity: [src/content/ui/modals/SearchTrigger.vue](../src/content/ui/modals/SearchTrigger.vue#L38), [src/content/ui/modals/SearchTrigger.vue](../src/content/ui/modals/SearchTrigger.vue#L67), and [src/content/ui/modals/SearchTrigger.vue](../src/content/ui/modals/SearchTrigger.vue#L68).
- Dark and AMOLED muted text tokens are already low enough that extra opacity pushes them under the threshold: [src/styles/_theme-tokens.scss](../src/styles/_theme-tokens.scss#L57) and [src/styles/_theme-tokens.scss](../src/styles/_theme-tokens.scss#L141).

Suggested fix:
- Stop stacking opacity reductions on already-muted text in dark surfaces.
- Raise muted text token values for dark and AMOLED, or use dedicated footer/search tokens with stronger contrast.
- Re-test the footer disclaimer block, render-time text, and search placeholder after token changes.

Definition of done:
- Lighthouse no longer reports color-contrast failures in the footer and footer search trigger.

### P2. Dialog and popover focus management is incomplete

Impact:
- Keyboard users may tab behind overlays.
- Focus may not return to the invoking control after close.
- Manual accessibility audits are likely to flag this even if automated audits do not.

Evidence:
- Search modal sets initial focus, but only adds Escape handling and dialog semantics: [src/content/ui/modals/SearchModal.vue](../src/content/ui/modals/SearchModal.vue#L29), [src/content/ui/modals/SearchModal.vue](../src/content/ui/modals/SearchModal.vue#L30), and [src/content/ui/modals/SearchModal.vue](../src/content/ui/modals/SearchModal.vue#L40).
- Sub-thread modal has Escape handling and dialog semantics but no managed focus: [src/content/comments/SubThreadModal.vue](../src/content/comments/SubThreadModal.vue#L46) and [src/content/comments/SubThreadModal.vue](../src/content/comments/SubThreadModal.vue#L72).
- Theme picker uses dialog semantics without focus management: [src/content/ui/shell/ThemeToggle.vue](../src/content/ui/shell/ThemeToggle.vue#L60).

Suggested fix:
- Trap focus within modal surfaces while open.
- Restore focus to the invoking control on close.
- Consider using a shared dialog/popover primitive so search, thread modal, and theme picker behave consistently.

Definition of done:
- Keyboard focus cannot escape open dialogs unintentionally.
- Focus returns to the invoking button when each surface closes.

### P2. Font assets are 404ing in production

Impact:
- Lighthouse reports console errors.
- Fallback fonts may alter spacing and readability unexpectedly.
- This may mask or amplify other layout and contrast issues.

Evidence:
- The stylesheet imports fontsource packages directly via CSS import URLs: [src/styles/main.scss](../src/styles/main.scss#L3), [src/styles/main.scss](../src/styles/main.scss#L4), [src/styles/main.scss](../src/styles/main.scss#L5), and [src/styles/main.scss](../src/styles/main.scss#L6).
- Lighthouse recorded 404s against the host origin for the generated font files in [lighthouse.json](../lighthouse.json).

Likely root cause:
- These imports appear to resolve as page-relative font requests instead of extension-origin asset requests when injected as a content-script stylesheet.

Suggested fix:
- Move font imports into the JS entry path or otherwise ensure the built CSS rewrites font URLs to extension-resolvable assets.
- Re-run Lighthouse and confirm the console is clean.

Definition of done:
- No font 404s appear in the console during page load.

### P3. Pagination link text is too generic

Impact:
- Weak semantic description for crawlers and some assistive-tech link lists.

Evidence:
- Pagination renders a bare More label: [src/content/ui/primitives/Pagination.vue](../src/content/ui/primitives/Pagination.vue#L12).

Suggested fix:
- Change the visible text to something more descriptive, such as More stories or Next page.
- If preserving More is important for product reasons, add a more descriptive accessible label.

## Not Extension-Owned In This Audit

These showed up in Lighthouse, but they are not realistically fixable from this content-script project:

- Missing doctype on the source Hacker News document.
- Missing meta description on the source Hacker News document.

## Positive Signals

- The app shell exposes a main landmark: [src/content/layout/AppShell.vue](../src/content/layout/AppShell.vue#L30).
- Many icon-only controls already include explicit labels, which avoided broader button-name failures.
- Search opens with immediate focus on the input, which is a good baseline even though it still needs full dialog focus management.

## Recommended Execution Order

1. Fix label-in-name mismatches.
2. Fix story metadata tap targets.
3. Fix dark-theme contrast regressions.
4. Clean up dialog focus behavior.
5. Fix font asset loading.
6. Tidy pagination link text if desired.