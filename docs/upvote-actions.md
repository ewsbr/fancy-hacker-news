# Upvote Actions

The vote and flag flow no longer depends on Hacker News' global `clicky` handler or DOM id conventions.

## How It Works

1. Parsers collect the raw HN action URLs from the original page DOM.
   - Stories expose `voteUp` and `voteUn`.
   - Comments and threads expose `voteUp`, `voteDown`, `voteUn`, and `flagUrl` when available.
   - Poll options now keep `voteUn` as local reactive state as well.

2. The content script wraps parsed `pageData` in Vue reactivity in `src/content/main.ts` before providing it to the app.

3. Interactive components pass the parsed story/comment/item object into the shared action helper in `src/content/shared/useHnActions.ts`.

4. `useHnActions.ts` performs the actual HN GET request.
   - Votes are sent with `js=t`, matching HN's own client-side vote behavior.
   - Flags use the parsed `flagUrl` directly.

5. After a successful request, the helper mutates the same reactive object the UI is already rendering.
   - Upvote/downvote sets a derived `voteUn` URL.
   - Unvote clears `voteUn`.
   - Flag toggles both `isFlagged` and `flagUrl` between flag and unflag forms.

Because the components render reactive parser models directly, those mutations update the UI immediately without reloading the page.

## Scope

This refactor covers vote and flag actions only.

Native HN links such as hide and favorite still use their existing navigation behavior.

## Verification Limits

- Upvote and unvote behavior is covered by the focused unit test in `test/content/useHnActions.test.ts`.
- Downvote and flag/unflag follow Hacker News' existing URL conventions and local state transitions, but this repo does not currently include fixture coverage for a karma-enabled account that can exercise those paths end to end.
- The shared action helper documents those assumptions inline so the next person knows those branches are implemented as best-guess compatibility, not fixture-verified behavior.