# Code Review Tracking - 2026-04-09

Scope: maintainability-focused code review of the Fancy HackerNews extension codebase, centered on duplication, theming, file organization, Vue 3.5 practices, hard-to-maintain functions, and general JavaScript quality.

Method:
- Reviewed the production code under `src/`.
- Scanned for duplicated parser logic, duplicated style patterns, and hardcoded color usage outside the theme token system.
- Inspected larger Vue SFCs and entry-point/parser files for architecture and maintainability risks.
- Ran `pnpm typecheck` and `pnpm test` to distinguish structural issues from immediately failing code.

Limits:
- This is a source review, not a visual QA pass across every route.
- `concepts/` was treated as exploratory and not included in the main issue list.
- The worktree was already dirty, so this document reflects read-only review findings rather than patch validation.

## Priority Summary

### P1 - Fix next

- [x] Tooltip portal target is resolved too early and can disable proper overlay portaling.
- [x] Global `Cmd/Ctrl+K` shortcut overrides normal text-editing behavior inside form fields.
- [ ] Mobile comment-thread behavior uses a non-reactive viewport flag and becomes stale after resize.
- [ ] Comment parsing logic is duplicated across multiple parsers and has already drifted.
- [ ] Theme data is duplicated across token, bootstrap, and UI layers and is already inconsistent.

### P2 - Fix soon

- [ ] Custom-top-bar pages hardcode a black/white logo treatment instead of deriving it from the parsed top-bar color.
- [ ] Large page/entry files are carrying too many responsibilities, especially item/comment route handling.
- [ ] App-wide provide/inject usage relies heavily on string keys and untyped implicit contracts.

### P3 - Nice to clean up

- [ ] Theme toggle styles contain duplicated transition rules and some dead selector structure.
- [ ] Footer theme overrides contain hardcoded colors, duplicated override logic, and unused selectors.
- [ ] Unused legacy production components remain in active source folders.

## Findings

### P1. Tooltip portal target is resolved too early

Status:
- Fixed

Category:
- Vue best practices
- Maintainability

Impact:
- Tooltips may render without portaling into `#fancy-hn-root`.
- Overlay behavior becomes dependent on local stacking and overflow contexts.
- The failure mode is subtle and easy to miss during routine development.

Evidence:
- The portal target is read at module evaluation time in [src/content/shared/Tooltip.vue](../src/content/shared/Tooltip.vue#L13).
- The root host does not exist until mount time in [src/content/main.ts](../src/content/main.ts#L250).
- The tooltip portal is disabled when no target exists in [src/content/shared/Tooltip.vue](../src/content/shared/Tooltip.vue#L22).

Suggested fix:
- Resolve the host lazily after mount, or compute it reactively at render time.
- Keep this wrapper aligned with `reka-ui` expectations instead of layering custom portal timing on top of it.
- Prefer a shared helper for “extension root host” lookups so portal-based UI does not duplicate this mistake.

Definition of done:
- Tooltip content always portals into `#fancy-hn-root` after the app mounts.
- Tooltip placement no longer depends on local container overflow or stacking quirks.

### P1. Global `Cmd/Ctrl+K` overrides normal form behavior

Status:
- Fixed

Category:
- Vue best practices
- General JavaScript quality

Impact:
- Users lose expected keyboard behavior while typing in text fields.
- This is most noticeable on editable pages such as the user profile and reply/submit flows.
- Global keyboard handlers become harder to extend safely over time.

Evidence:
- The handler is registered globally in [src/content/layout/AppShell.vue](../src/content/layout/AppShell.vue#L23).
- The shortcut opens search unconditionally in [src/content/layout/AppShell.vue](../src/content/layout/AppShell.vue#L16).
- The profile page includes editable controls in [src/content/pages/UserPage.vue](../src/content/pages/UserPage.vue#L32) and [src/content/pages/UserPage.vue](../src/content/pages/UserPage.vue#L51).

Suggested fix:
- Ignore the shortcut when focus is inside `input`, `textarea`, `select`, or `contenteditable` elements.
- If search remains a modal surface, move it toward a `reka-ui` dialog-based trigger/content pattern so keyboard handling and focus restoration are not hand-rolled in `AppShell.vue` and `SearchModal.vue`.
- Centralize global-key handling rules so future shortcuts follow the same guardrails.

Definition of done:
- `Cmd/Ctrl+K` only opens search when focus is outside editable controls.
- Text editing shortcuts continue to behave normally inside forms.

### P1. Mobile comment-thread behavior is not reactive to viewport changes

Status:
- Open

Category:
- Vue best practices
- Hard to maintain logic

Impact:
- Comment-thread UI can stay in the wrong mode after resizing across the mobile breakpoint.
- Responsive behavior is split between reactive and non-reactive approaches.
- Debugging comment rendering becomes harder because the breakpoint state is captured once, then frozen.

Evidence:
- `isMobileLayout` is provided once as a boolean in [src/content/main.ts](../src/content/main.ts#L201) and [src/content/main.ts](../src/content/main.ts#L280).
- `CommentNode.vue` injects that boolean and derives modal behavior from a plain constant in [src/content/comments/CommentNode.vue](../src/content/comments/CommentNode.vue#L20) and [src/content/comments/CommentNode.vue](../src/content/comments/CommentNode.vue#L34).
- A reactive shared mobile helper already exists in [src/state/useIsMobile.ts](../src/state/useIsMobile.ts#L8).

Suggested fix:
- Stop providing a one-time viewport boolean.
- Use the shared reactive mobile state in responsive comment components.

Definition of done:
- Comment-thread behavior updates correctly when crossing the `640px` breakpoint.
- Only one reactive mobile-layout source of truth remains in production code.

### P1. Comment parsing logic is duplicated and already drifting

Status:
- Open

Category:
- Duplicated code
- File organization
- Hard to maintain functions

Impact:
- Parser fixes need to be repeated in multiple files.
- Behavior can silently diverge across item, threads, and new-comments routes.
- Hacker News markup changes will be more expensive and riskier to absorb.

Evidence:
- Item-page comment row parsing is implemented in [src/parsers/item.ts](../src/parsers/item.ts#L129).
- Thread-page comment parsing reimplements nearly the same logic in [src/parsers/threads.ts](../src/parsers/threads.ts#L33).
- New-comments parsing repeats much of the same vote/body/state extraction in [src/parsers/newComments.ts](../src/parsers/newComments.ts#L41).
- Nav-link normalization has already drifted: item comments convert some nav links to hashes in [src/parsers/item.ts](../src/parsers/item.ts#L194), while threads keep full hrefs in [src/parsers/threads.ts](../src/parsers/threads.ts#L86).

Suggested fix:
- Extract shared comment-row parsing helpers for:
  - vote URLs
  - collapsed state/count
  - comment body + placeholder parsing
  - nav link normalization
  - story-context extraction where applicable
- Keep route-specific assembly thin and declarative.

Definition of done:
- Shared comment-row parsing logic lives in one place.
- Item, threads, and new-comments parsers differ only where the source markup genuinely differs.

### P1. Theme data is duplicated across multiple layers and is inconsistent

Status:
- Open

Category:
- Duplicated code
- Hardcoded theme data
- Maintainability

Impact:
- Theme changes require touching multiple files.
- Theme UI can disagree with the actual token system.
- Bootstrap paint, theme picker UI, and runtime theme state can drift apart.

Evidence:
- Canonical tokens live in [src/styles/_theme-tokens.scss](../src/styles/_theme-tokens.scss#L1).
- Bootstrap theme colors are separately hardcoded in [src/content/anti-fouc.js](../src/content/anti-fouc.js#L8).
- Theme swatch metadata is separately hardcoded in [src/content/shared/ThemeToggle.vue](../src/content/shared/ThemeToggle.vue#L12).
- AMOLED accent differs between the theme picker and token system in [src/content/shared/ThemeToggle.vue](../src/content/shared/ThemeToggle.vue#L16) and [src/styles/_theme-tokens.scss](../src/styles/_theme-tokens.scss#L138).
- Dark theme surface values also differ between bootstrap and picker data in [src/content/anti-fouc.js](../src/content/anti-fouc.js#L15) and [src/content/shared/ThemeToggle.vue](../src/content/shared/ThemeToggle.vue#L14).

Suggested fix:
- Introduce a single theme metadata source for:
  - theme names
  - preview swatch colors
  - bootstrap background/text fallback colors
- Keep SCSS tokens authoritative for full runtime styling, but derive lightweight JS theme metadata from one shared source.

Definition of done:
- Theme names and preview values are defined once.
- Bootstrap paint, theme picker, and runtime theme behavior stay aligned.

### P2. Custom-top-bar pages hardcode a black/white logo treatment

Status:
- Open

Category:
- Hardcoded colors without theme context
- Maintainability

Impact:
- The logo treatment can visually disagree with the parsed HN top-bar color.
- This weakens the value of the custom top-bar support that already exists in the parser and token layer.

Evidence:
- Custom top-bar color is parsed in [src/parsers/header.ts](../src/parsers/header.ts#L123).
- Header color variables are applied dynamically in [src/content/main.ts](../src/content/main.ts#L114).
- The header still hardcodes black/white logo props in [src/content/layout/SiteHeader.vue](../src/content/layout/SiteHeader.vue#L63) and [src/content/layout/SiteHeader.vue](../src/content/layout/SiteHeader.vue#L64).

Suggested fix:
- Feed the parsed top-bar color through the logo component and derive foreground color via the existing contrast helper.

Definition of done:
- Custom HN top-bar pages render a logo treatment consistent with the parsed top-bar color.

### P2. Large route and entry files are carrying too many responsibilities

Status:
- Open

Category:
- File organization
- Hard to maintain functions

Impact:
- Local changes require understanding parsing, state, DOM behavior, and rendering in the same file.
- Files become harder to test in isolation.
- Future contributors are more likely to add one more branch instead of extracting coherent units.

Evidence:
- The content entrypoint mixes route resolution, parsing, bootstrapping, DOM isolation, theming, debug timing, fragment restoration, and cleanup in [src/content/main.ts](../src/content/main.ts#L190).
- The item page mixes fragment-state management, DOM querying, scrolling logic, logging, and page rendering in [src/content/pages/CommentsPage.vue](../src/content/pages/CommentsPage.vue#L157).
- The user page is a very large SFC with profile rendering, editing, settings UI, and sidebar navigation in [src/content/pages/UserPage.vue](../src/content/pages/UserPage.vue#L1).

Suggested fix:
- Extract feature-level composables/helpers for:
  - content-script bootstrap and cleanup
  - fragment path resolution and scrolling
  - user-profile settings field rendering
- For overlay UI, prefer `reka-ui` primitives over custom modal/popover state machines:
  - search should use a dialog primitive
  - sub-thread view should use a dialog primitive
  - theme selection should use a popover or menu primitive
- Keep page SFCs focused on data wiring and template structure.

Definition of done:
- Main entry and major page components have narrower responsibilities.
- Fragment scrolling and bootstrap logic can be tested without page-template coupling.

### P2. App-wide provide/inject contracts are mostly string-keyed and implicit

Status:
- Open

Category:
- Vue best practices
- Maintainability

Impact:
- Cross-component dependencies are harder to trace.
- Refactors are more fragile because providers and consumers are linked by string literals.
- Type safety is weaker than it should be in a strict TypeScript Vue app.

Evidence:
- App-level dependencies are provided with string keys in [src/content/main.ts](../src/content/main.ts#L276).
- Search control uses a string-keyed injected function in [src/content/layout/AppShell.vue](../src/content/layout/AppShell.vue#L14) and [src/content/shared/SearchTrigger.vue](../src/content/shared/SearchTrigger.vue#L12).
- A typed symbol-based pattern already exists for fragment state in [src/content/pages/CommentsPage.vue](../src/content/pages/CommentsPage.vue#L68).

Suggested fix:
- Replace string-keyed app-wide injections with exported `InjectionKey`s.
- Removing the custom `openSearch` injection entirely is preferable if search is reworked around a `reka-ui` dialog trigger/content composition.
- Reserve raw string keys for temporary or throwaway internal wiring only.

Definition of done:
- Shared app context uses typed injection keys consistently.
- Provide/inject dependencies are discoverable from source and type-safe during refactors.

### P3. Theme toggle styles contain duplicated transition rules

Status:
- Open

Category:
- Duplicated styles

Impact:
- Style ownership is unclear.
- It is easy to “fix” one transition block while leaving another behind.

Evidence:
- Transition rules are defined once inside `.theme-toggle` in [src/content/shared/ThemeToggle.vue](../src/content/shared/ThemeToggle.vue#L255).
- The same rules are duplicated again globally in [src/content/shared/ThemeToggle.vue](../src/content/shared/ThemeToggle.vue#L268).

Suggested fix:
- Keep a single transition definition for the `tt-pop` transition classes.
- If theme selection moves to a `reka-ui` popover/menu primitive, let that primitive own more of the open/close behavior so the component only styles state instead of orchestrating it.
- Remove the incorrectly scoped duplicate block.

Definition of done:
- Transition behavior is defined once and behaves the same.

### P3. Footer theme overrides are hardcoded and contain dead selector structure

Status:
- Open

Category:
- Hardcoded colors without a theme
- Duplicated styles

Impact:
- Footer styling is harder to reason about than the rest of the tokenized theme system.
- Future theme work will require remembering footer-specific exceptions.

Evidence:
- The footer carries a large light-theme override block with hardcoded colors in [src/content/layout/SiteFooter.vue](../src/content/layout/SiteFooter.vue#L145).
- AMOLED footer styling also bypasses shared tokens in [src/content/layout/SiteFooter.vue](../src/content/layout/SiteFooter.vue#L200).
- Some selectors in that override block do not appear to correspond to active markup, such as [site-footer__sep](../src/content/layout/SiteFooter.vue#L161) and [site-footer__copyright](../src/content/layout/SiteFooter.vue#L175).

Suggested fix:
- Move footer theming back toward shared tokens or footer-specific tokens.
- Remove unused selectors during the cleanup so the remaining override surface is intentional.

Definition of done:
- Footer theming is token-driven and easier to compare with the rest of the app.
- Unused selector branches are removed.

### P3. Unused legacy production components remain in active folders

Status:
- Open

Category:
- File organization

Impact:
- Searches return obsolete components alongside current ones.
- New contributors have a weaker signal on which component is authoritative.

Evidence:
- [src/content/shared/StoryItem.vue](../src/content/shared/StoryItem.vue) is present in the production tree.
- A search for usage did not find active references to `StoryItem` in `src/` or `test/`.

Suggested fix:
- Remove the file if it is truly obsolete, or relocate it to an explicit legacy/archive location if it still has documentary value.

Definition of done:
- Story rendering has one clear, current component path in production code.

## Cross-Cutting Cleanup Opportunities

These are not separate priority items, but they showed up repeatedly during review:

- Shared parser helpers should absorb repeated `introHtml` extraction currently duplicated in [src/parsers/storyList.ts](../src/parsers/storyList.ts#L36) and [src/parsers/newComments.ts](../src/parsers/newComments.ts#L30).
- Header/top-bar constants are split between parser, bootstrap, and UI code in [src/parsers/header.ts](../src/parsers/header.ts#L29), [src/content/anti-fouc.js](../src/content/anti-fouc.js#L8), and [src/content/shared/YCombinatorLogo.vue](../src/content/shared/YCombinatorLogo.vue#L10).
- Responsive logic is split between direct `matchMedia` calls and the shared mobile helper in [src/content/main.ts](../src/content/main.ts#L201), [src/content/pages/CommentsPage.vue](../src/content/pages/CommentsPage.vue#L201), and [src/state/useIsMobile.ts](../src/state/useIsMobile.ts#L8).
- Overlay behavior is being hand-built in several places even though `reka-ui` is already in use for tooltips. Search, sub-thread modal, and theme selection should converge on `reka-ui` primitives so focus, escape handling, portaling, and trigger wiring are not reimplemented per component.

## Validation

- `pnpm typecheck` passed.
- `pnpm test` passed.

## Recommended Execution Order

1. Fix the tooltip portal target bug.
2. Rework search, sub-thread modal, and theme selection around `reka-ui` dialog/popover primitives.
3. Guard global keyboard shortcuts from editable fields.
4. Make mobile comment-thread behavior reactive.
5. Consolidate duplicated comment parser logic.
6. Unify theme metadata across tokens, bootstrap, and theme UI.
7. Reduce large-file responsibility in `main.ts` and item/comment page logic.
8. Convert shared app injections to typed `InjectionKey`s or remove them where `reka-ui` composition makes them unnecessary.
9. Clean up footer/theme-toggle style duplication and remove dead legacy files.
