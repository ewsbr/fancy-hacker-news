- The parent comment on a comment thread isn't highlighted enough 
- Remove fixtures leaking my tokens

- Features I cannot test:
  - flags
  - downvote
  - HN-specific downvote clicky DOM parity and regression fixture coverage

- Maybe batch render for 100+ comments

- Accessibility, Lighthouse etc
- We need a 404
- Improve /submit and reply forms
- Reply could get some love, maybe add inline replies

- Add a # to link to this comment

Performance follow-up
- Investigate item parser hotspot: `main:parse-page:item` was ~61 ms on `/item?id=47582220`, with `item:build-comment-tree` accounting for ~57 ms of that work.
- Investigate initial render hotspot: `main:app-mount` was ~74 ms on the same page while mounting 849 comments.
- Investigate post-mount browser cost: total render was ~298 ms, which implies a large layout/paint gap after `app-mount` before the first `requestAnimationFrame` callback resumed.
- `collect-comment-rows` was only ~2 ms and the DOM hide/style removal/create-host phases were negligible, so optimization effort should focus on comment tree construction and initial comment rendering.

# BASE FEATURES
Thin Black Bar

Occasionally, there will be a thin black bar at the top of the top bar, in memoriam of a significant figure in the tech/science community dying. A Hacker News submission about the death will usually be on the front page at that time.

Top Bar Color

If a user has 251 Karma, they can set the color of the top bar in their profile settings. The default is #ff6600. The Y Combinator logo will change its color to match the top bar.

Here's the list of colors from users who have recently posted.