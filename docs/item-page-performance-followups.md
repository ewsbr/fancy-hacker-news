# Item Page Performance Follow-Ups

This note tracks the next performance improvements for long Hacker News item threads after the initial progressive-rendering and first-paint instrumentation work.

## Current State

- Initial comment rendering now batches for mid-large threads instead of waiting for 600+ comments.
- First visible paint is measured more accurately with `main:first-content-paint`.
- Progressive comment batches are held until after initial paint so pre-paint work does not hide the first visible frame.
- Debug output now includes progressive batch summaries when at least one batch frame has run.

## Follow-Up Candidates

### 1. Remove Deep Reactivity From Parsed Comment Trees

Current issue:
- `makeReactive()` in [src/content/main.ts](/home/ews/WebstormProjects/hackernews/src/content/main.ts) wraps the full parsed page tree, including every nested comment node.
- Most parsed fields are immutable after parse and do not benefit from being proxied by Vue.

Expected payoff:
- Lower mount cost.
- Less proxy creation and dependency tracking on large trees.

Suggested direction:
- Keep parsed comment data raw or shallow.
- Move only mutable fields into reactive islands:
  - collapse state
  - vote/unvote state
  - flag state
  - modal visibility
  - fragment highlight state

### 2. Flatten Hot Comment-Row Component Trees

Current issue:
- Each visible comment row instantiates several small components:
  - `CommentUserMeta`
  - `AuthorByline`
  - `Badge`
  - `MetaSep`
  - `FragmentLinkButton`
  - `CommentActions`
- This increases instance count substantially on large pages.

Expected payoff:
- Faster mount and diffing on long threads.
- Lower per-node overhead during progressive rendering.

Suggested direction:
- Keep larger structural components.
- Inline very small presentational components inside the hot comment row path.
- Re-evaluate `lucide` icon usage in the hot path if SVG component creation is measurable.

### 3. Reduce Per-Node Watcher Count

Current issue:
- `CommentNode.vue` sets up watchers for:
  - modal-opening on hash-path changes
  - collapse state
  - hash-path updates
  - initial-paint batch gating
- This scales with every rendered comment node.

Expected payoff:
- Lower reactive bookkeeping on mount.
- Less scheduler work during hash updates and progressive reveal.

Suggested direction:
- Centralize more fragment-path logic in `CommentsPage.vue` or `CommentTree.vue`.
- Prefer direct event-driven updates over many distributed watchers where possible.

### 4. Cap Initial Render By Actual Rendered Nodes, Not Only Subtree Cost

Current issue:
- The current batching logic budgets by `descendantCount + 1`.
- Two heavy roots can still produce 100+ visible DOM nodes before first paint.

Expected payoff:
- Better control over first visible content cost.
- More consistent first paint across uneven thread shapes.

Suggested direction:
- Add an optional cap based on rendered `.comment-node` count.
- Consider a hybrid budget:
  - subtree cost cap
  - visible node cap

### 5. Measure Browser Layout/Paint More Explicitly

Current issue:
- We now have better first-paint timing, but long-thread cost may still include browser layout and style work after Vue finishes mounting.

Expected payoff:
- Better separation of:
  - parse cost
  - Vue mount cost
  - progressive batch cost
  - browser presentation cost

Suggested direction:
- Add debug snapshots for:
  - rendered root count
  - rendered comment-node count
  - host text length
  - post-paint frame progression
- If needed, add optional browser-profiler validation for representative fixtures.

## Suggested Execution Order

1. Remove deep reactivity from parsed item/comment data.
2. Add a visible-node cap to initial comment rendering.
3. Flatten hot-path comment-row components.
4. Reduce per-node watchers after the above changes settle.
