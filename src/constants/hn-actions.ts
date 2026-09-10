// HN uses votex for authenticated votes and still emits vote for logged-out links.
export const VOTE_LINK_SELECTOR = 'a:is([href^="vote?"], [href^="votex?"])';
