/**
 * Pure URL -> route resolver.
 */

const STORY_TYPES = new Map([
  ['/', 'top'],
  ['/news', 'top'],
  ['/newest', 'new'],
  ['/front', 'front'],
  ['/ask', 'ask'],
  ['/show', 'show'],
  ['/jobs', 'jobs'],
  ['/shownew', 'shownew'],
  ['/pool', 'pool'],
  ['/active', 'active'],
  ['/best', 'best'],
  ['/noobstories', 'noobstories'],
  ['/asknew', 'asknew'],
  ['/classic', 'classic'],
  ['/invited', 'invited'],
  ['/launches', 'launches'],
  ['/from', 'from'],
]);

export type PageName
  = | 'stories'
    | 'item'
    | 'login'
    | 'static'
    | 'user'
    | 'threads'
    | 'newcomments'
    | 'submitted'
    | 'hidden'
    | 'favorites'
    | 'upvoted'
    | 'submit'
    | 'reply'
    | 'formatdoc'
    | 'leaders'
    | 'lists'
    | 'topcolors'
    | 'delete-confirm'
    | 'notfound';

export interface RouteDescriptor {
  page: PageName;
  params: {
    /** Story list type. */
    type?: string;
    /** /best hour range. */
    h?: string;
    /** Comment tab of /favorites and /upvoted. */
    comments?: string;
  };
}

const PAGES = new Map<string, PageName>([
  ['/newcomments', 'newcomments'],
  ['/noobcomments', 'newcomments'],
  ['/bestcomments', 'newcomments'],
  ['/highlights', 'newcomments'],
  ['/latest', 'newcomments'],
  ['/item', 'item'],
  ['/reply', 'reply'],
  ['/replyx', 'reply'],
  ['/user', 'user'],
  ['/submitted', 'submitted'],
  ['/threads', 'threads'],
  ['/hidden', 'hidden'],
  ['/favorites', 'favorites'],
  ['/upvoted', 'upvoted'],
  ['/submit', 'submit'],
  ['/formatdoc', 'formatdoc'],
  ['/lists', 'lists'],
  ['/topcolors', 'topcolors'],
  ['/leaders', 'leaders'],
  ['/delete-confirm', 'delete-confirm'],
  ...['/login', '/loginx', '/comment', '/changepw', '/forgot', '/vote', '/votex', '/hide', '/fave', '/favex']
    .map(path => [path, 'login'] as const),
]);

export function resolveRoute(loc: Location): RouteDescriptor {
  const search = new URLSearchParams(loc.search);
  const storyType = STORY_TYPES.get(loc.pathname);
  if (storyType) {
    const hours = loc.pathname === '/best' ? search.get('h') : null;
    return { page: 'stories', params: hours === null ? { type: storyType } : { type: storyType, h: hours } };
  }

  const page = PAGES.get(loc.pathname) ?? 'static';
  const comments = search.get('comments');
  if ((page === 'favorites' || page === 'upvoted') && comments !== null) {
    return { page, params: { comments } };
  }

  return { page, params: {} };
}
