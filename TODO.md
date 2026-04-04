- The parent comment on a comment thread isn't highlighted enough 
- Remove fixtures leaking my tokens

- Features I cannot test:
  - flags
  - downvote

- Upvote buttons ain't expanding on mobile

- Deletion via https://news.ycombinator.com/delete-confirm?id=47632301&goto=item%3Fid%3D47629433
<html><head></head><body>You can't delete that.</body></html>
- Accessibility, Lighthouse etc

- Some pages don't show the username, we should hide login
- Tooltip sucks
- Rework doc pages .html and add links to each other

Performance follow-up
- Investigate item parser hotspot: `main:parse-page:item` was ~61 ms on `/item?id=47582220`, with `item:build-comment-tree` accounting for ~57 ms of that work.
- Investigate initial render hotspot: `main:app-mount` was ~74 ms on the same page while mounting 849 comments.
- Investigate post-mount browser cost: total render was ~298 ms, which implies a large layout/paint gap after `app-mount` before the first `requestAnimationFrame` callback resumed.
- `collect-comment-rows` was only ~2 ms and the DOM hide/style removal/create-host phases were negligible, so optimization effort should focus on comment tree construction and initial comment rendering.

Final security
- No requests
- No XSS