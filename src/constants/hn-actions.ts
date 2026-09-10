// HN emits both action families. Match the known pairs and preserve the source URL.
// Known pairs are listed in https://news.ycombinator.com/robots.txt.
export const VOTE_LINK_SELECTOR = 'a:is([href^="vote?"], [href^="votex?"])';
export const FAVORITE_LINK_SELECTOR = 'a:is([href^="fave?"], [href^="favex?"])';
export const REPLY_LINK_SELECTOR = 'a:is([href^="reply?"], [href^="replyx?"])';
