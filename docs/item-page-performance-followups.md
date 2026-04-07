# Item Page Simplification Plan

This note replaces the earlier micro-optimization list with a simpler conclusion from the current measurements: the comment pipeline is doing too much in too many places.

The earlier item-page path had three different kinds of complexity layered together:

- full synchronous parse of every comment row in [src/parsers/item.ts](/home/ews/WebstormProjects/hackernews/src/parsers/item.ts)
- root-level progressive rendering in [src/content/comments/CommentTree.vue](/home/ews/WebstormProjects/hackernews/src/content/comments/CommentTree.vue)
- child-level progressive rendering plus per-node watchers and action state in [src/content/comments/CommentNode.vue](/home/ews/WebstormProjects/hackernews/src/content/comments/CommentNode.vue)

That was hard to reason about, hard to debug, and still scaled badly on extreme threads.

## Current Branch State

The simplification pass has already removed the comment batching and the eager per-comment action store:

- [src/content/comments/CommentTree.vue](/home/ews/WebstormProjects/hackernews/src/content/comments/CommentTree.vue) now renders roots synchronously
- [src/content/comments/CommentNode.vue](/home/ews/WebstormProjects/hackernews/src/content/comments/CommentNode.vue) no longer batches child rendering
- [src/state/itemPageState.ts](/home/ews/WebstormProjects/hackernews/src/state/itemPageState.ts) no longer creates per-comment reactive action islands
- [src/content/shared/FragmentLinkButton.vue](/home/ews/WebstormProjects/hackernews/src/content/shared/FragmentLinkButton.vue) is now stateless
- [src/parsers/item.ts](/home/ews/WebstormProjects/hackernews/src/parsers/item.ts) now switches to root-shell parsing above the extreme-thread threshold and only eagerly parses the hash-target root when needed
- [src/content/comments/LazyCommentRoot.vue](/home/ews/WebstormProjects/hackernews/src/content/comments/LazyCommentRoot.vue) loads and unloads root subtrees on demand

That means the next performance work is no longer scheduler tuning or first-pass shell loading. It is refinement of the large-thread mode.

## Measured Reality

Two recent item-page traces are enough to define the problem shape.

### Mid-Large Thread: About 460 Comments

Observed timings:

- `main:parse-page:item`: about `31ms`
- `main:app-mount`: about `208ms`
- `main:first-content-paint`: about `274ms`

Conclusion:

- the parser is already cheap here
- the mount/render path is the bottleneck
- the current root batching helps enough to keep first paint below `400ms`

### Extreme Thread: About 9600 Comments

Observed timings:

- `item:build-comment-tree`: about `657ms`
- `main:parse-page:item`: about `680ms`
- `main:app-mount`: about `18ms`
- `main:first-content-paint`: about `762ms`

Conclusion:

- Vue is not the main issue on extreme threads
- the all-at-once parser is the wall
- no amount of render-side batching will get extreme threads below `400ms` if we still finish parsing the full tree before paint

## What We Can Remove

If the goal is simpler code plus lower memory use, the right move is to delete layers rather than tune them.

### 1. Remove Child Progressive Rendering Entirely

Current code:

- child queue state, watchers, and `requestAnimationFrame` scheduling in [src/content/comments/CommentNode.vue](/home/ews/WebstormProjects/hackernews/src/content/comments/CommentNode.vue)

Why it should go:

- it adds per-node scheduling complexity
- it creates several watchers on every rendered comment
- it is not the mechanism that saves extreme threads
- it makes fragment behavior depend on many small local queues

Replacement:

- one page-level or root-level loading strategy only
- once a root thread is visible, render that root thread synchronously

### 2. Remove Eager Per-Comment Action State

Current code:

- `getCommentActionState()` in [src/state/itemPageState.ts](/home/ews/WebstormProjects/hackernews/src/state/itemPageState.ts)
- eager use in [src/content/comments/CommentNode.vue](/home/ews/WebstormProjects/hackernews/src/content/comments/CommentNode.vue)

Why it should go:

- every rendered comment creates reactive state even if the user never votes or flags
- every `CommentActions` and `FlagButton` instance creates its own `useHnActions()` state
- this is pure memory overhead on large pages

Replacement:

- default to native links for vote, reply, edit, delete, and flag on extreme threads
- if local action updates are still desired, create reactive action state lazily on first interaction only

### 3. Flatten The Hot Comment Row

Current hot path per rendered comment includes several tiny components:

- [src/content/shared/CommentUserMeta.vue](/home/ews/WebstormProjects/hackernews/src/content/shared/CommentUserMeta.vue)
- [src/content/shared/AuthorByline.vue](/home/ews/WebstormProjects/hackernews/src/content/shared/AuthorByline.vue)
- [src/content/shared/CommentActions.vue](/home/ews/WebstormProjects/hackernews/src/content/shared/CommentActions.vue)
- [src/content/shared/FragmentLinkButton.vue](/home/ews/WebstormProjects/hackernews/src/content/shared/FragmentLinkButton.vue)
- badges, separators, and lucide icon components

Why it should go:

- this inflates both instance count and memory use linearly with rendered comments
- it does not help first paint on extreme threads
- it is easy to replace with inline markup in the hot path

Replacement:

- inline metadata and action markup inside [src/content/comments/CommentNode.vue](/home/ews/WebstormProjects/hackernews/src/content/comments/CommentNode.vue)
- keep the reusable shared components for non-hot paths only if they still add value elsewhere

### 4. Disable Mobile Subthread Modal In Extreme Mode

Current code:

- modal branching in [src/content/comments/CommentNode.vue](/home/ews/WebstormProjects/hackernews/src/content/comments/CommentNode.vue)
- modal subtree rerender in [src/content/comments/SubThreadModal.vue](/home/ews/WebstormProjects/hackernews/src/content/comments/SubThreadModal.vue)

Why it should go in extreme mode:

- it is extra UI logic on top of an already large thread
- it creates another copy of a subtree in the DOM when opened
- it is not needed to hit the first-load target

Replacement:

- for extreme threads, use plain inline expansion only

## Simplest Architecture That Can Hit Sub-400ms

For extreme threads, the first paint budget is impossible if we insist on:

- full comment-tree parse before paint
- full nested render before paint
- local per-node reactive interaction state

The lowest-complexity design that can plausibly stay below `400ms` is this:

### Normal Threads: Up To About 2000 Comments

- keep a full parse in [src/parsers/item.ts](/home/ews/WebstormProjects/hackernews/src/parsers/item.ts)
- keep the rendering path synchronous and simple
- avoid adding new comment-tree schedulers unless a measured regression leaves no simpler option

Why this is the right default:

- it keeps the code understandable
- it avoids another round of root-versus-child batching complexity
- it gives a clean baseline before adding large-thread mode

### Extreme Threads: More Than About 2000 Comments

Do not fully parse comments before first paint.

Instead:

1. Collect `tr.athing.comtr` rows once.
2. Split them into root-thread slices by indent.
3. Build lightweight root shells only:
   - root id
   - author
   - age
   - collapsed/deleted/flagged markers
   - comment count for the slice
4. First paint the story plus those root shells.
5. Parse a root slice only when one of these happens:
   - the user expands the root
   - the user clicks a `Load next threads` control
   - the page needs the hash target's root before scroll

This is effectively manual loading by root thread, not viewport virtualization.

Why this is the right simplification:

- one cheap initial scan instead of one huge recursive parse
- one loading boundary that matches HN structure naturally
- no child-level scheduling
- far less DOM and reactive state alive at once
- fragment handling stays manageable because a hash target only needs one root slice eagerly parsed

## Memory Implications

The current memory profile is bad because we eventually keep too much alive at the same time:

- original HN DOM until cleanup
- parsed JS tree for every comment
- Vue component instances for every rendered comment
- local reactive state per rendered comment
- nested DOM for every rendered comment body and action row

For `10k` comments, memory will remain poor unless we stop rendering all comments at once.

The most effective memory simplification is:

- never fully mount all comment roots for extreme threads
- keep most roots as lightweight shells
- parse and render full subtrees only on demand

If memory is still too high after that, the next simple guard is:

- when an expanded extreme-thread root is collapsed again, discard its parsed subtree and return it to shell form

That is much simpler than viewport virtualization and gives predictable memory bounds.

## Fragment Scrolling Constraints

The current fragment path in [src/content/pages/CommentsPage.vue](/home/ews/WebstormProjects/hackernews/src/content/pages/CommentsPage.vue) is the main behavior worth preserving.

The simplest way to preserve it is:

- if there is no hash, do not eagerly parse any extreme-thread subtrees
- if there is a hash, find the root slice that contains the target comment id during the initial scan
- eagerly parse only that one root slice before first paint
- force that root shell open and scroll after mount

This is much simpler than trying to keep fragment scrolling compatible with multiple nested render queues.

## Recommended Execution Order

### Phase 1: Delete Complexity

Completed:

1. Remove child progressive rendering from [src/content/comments/CommentNode.vue](/home/ews/WebstormProjects/hackernews/src/content/comments/CommentNode.vue).
2. Remove root progressive rendering from [src/content/comments/CommentTree.vue](/home/ews/WebstormProjects/hackernews/src/content/comments/CommentTree.vue).
3. Stop creating eager action state per rendered comment in [src/state/itemPageState.ts](/home/ews/WebstormProjects/hackernews/src/state/itemPageState.ts).

Expected result:

- less code
- less per-node memory
- easier-to-reason-about fragment behavior

### Phase 2: Add Extreme-Thread Shell Mode

Completed in initial form:

1. Introduce an extreme-thread threshold around `2000` comments.
2. Replace full pre-paint parsing with root-shell scanning for that mode.
3. Add one simple manual loader:
   - `Load thread`
4. Eagerly parse only the hash target root when needed.

Still open:

1. Decide whether `Load next 10 roots` is preferable to per-root loading for keyboard-heavy users.
2. Decide whether unloading should remain manual or also happen automatically when a loaded thread is collapsed.
3. Re-measure the large real-world threads and tune the threshold if needed.

Expected result:

- first paint below `400ms` becomes realistic even for the largest HN threads
- memory use stays bounded because most of the tree stays unparsed and unmounted

### Phase 3: Only If Needed Later

- add automatic post-paint loading for a few extra roots
- add subtree eviction when users collapse loaded extreme-thread roots
- consider more advanced viewport-based loading only if manual root loading proves unacceptable

## Bottom Line

The current batching code is more complex than the value it provides.

The most realistic simplification is not to build a smarter scheduler. It is to remove most scheduling entirely:

- one simple synchronous strategy for normal threads
- one shell-plus-manual-load strategy for extreme threads

That is the clearest path to both goals:

- first visible content below `400ms`
- memory that does not explode on `10k` comment pages
