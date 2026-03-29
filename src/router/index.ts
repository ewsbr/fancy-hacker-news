/**
 * URL → page resolver.
 * Pure function — no SPA navigation, no side effects.
 */

export interface RouteDescriptor {
  page: string;
  params: Record<string, string>;
}

const STORY_LISTS = new Set([
  '/', '/news', '/newest', '/front', '/ask', '/show', '/jobs',
  '/shownew', '/pool', '/active', '/best', '/bestcomments', '/noobstories',
]);

const STORY_TYPE: Record<string, string> = {
  '/': 'top',
  '/news': 'top',
  '/newest': 'new',
  '/front': 'front',
  '/ask': 'ask',
  '/show': 'show',
  '/jobs': 'jobs',
  '/shownew': 'shownew',
  '/pool': 'pool',
  '/active': 'active',
  '/best': 'best',
  '/bestcomments': 'bestcomments',
  '/noobstories': 'noobstories',
};

const AUTH_PAGES = new Set(['/login', '/comment', '/changepw', '/forgot', '/vote']);

const STATIC_PAGES = new Set(['/newsfaq', '/newsguidelines', '/leaders', '/formatdoc']);

const USER_LISTS = new Map<string, string>([
  ['/submitted', 'submitted'],
  ['/threads', 'threads'],
  ['/upvoted', 'upvoted'],
  ['/hidden', 'hidden'],
]);

export function resolveRoute(loc: Location): RouteDescriptor {
  const path = loc.pathname;
  const sp = new URLSearchParams(loc.search);

  if (STORY_LISTS.has(path)) {
    return { page: 'stories', params: { type: STORY_TYPE[path] } };
  }

  if (path === '/newcomments') return { page: 'newcomments', params: {} };
  if (path === '/noobcomments') return { page: 'newcomments', params: { type: 'noob' } };

  if (path === '/item') return { page: 'item', params: { id: sp.get('id') ?? '' } };
  if (path === '/reply') return { page: 'reply', params: { id: sp.get('id') ?? '', goto: sp.get('goto') ?? '' } };
  if (path === '/user') return { page: 'user', params: { id: sp.get('id') ?? '' } };

  if (USER_LISTS.has(path)) {
    return { page: USER_LISTS.get(path)!, params: { id: sp.get('id') ?? '' } };
  }

  if (path === '/favorites') {
    const params: Record<string, string> = { id: sp.get('id') ?? '' };
    const comments = sp.get('comments');
    if (comments !== null) params.comments = comments;
    return { page: 'favorites', params };
  }

  if (path === '/submit') return { page: 'submit', params: {} };
  if (AUTH_PAGES.has(path)) return { page: 'login', params: {} };
  if (STATIC_PAGES.has(path)) return { page: 'static', params: {} };

  // Catch-all
  return { page: 'static', params: {} };
}
