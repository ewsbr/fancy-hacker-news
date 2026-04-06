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
  '/shownew', '/pool', '/active', '/best', '/noobstories',
  '/asknew', '/classic', '/invited', '/launches', '/from',
]);

const COMMENT_LISTS = new Set([
  '/newcomments', '/noobcomments', '/bestcomments', '/highlights',
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
  '/noobstories': 'noobstories',
  '/asknew': 'asknew',
  '/classic': 'classic',
  '/invited': 'invited',
  '/launches': 'launches',
  '/from': 'from',
};

const AUTH_PAGES = new Set([
  '/login',
  '/comment',
  '/changepw',
  '/forgot',
  '/vote',
  '/hide',
  '/fave',
]);

const STATIC_PAGES = new Set([
  '/newsfaq.html',
  '/newsguidelines.html',
  '/newswelcome.html',
  '/showhn.html',
  '/security.html',
]);

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
    const params: Record<string, string> = { type: STORY_TYPE[path] };
    const site = sp.get('site');
    if (site !== null) params.site = site;
    return { page: 'stories', params };
  }

  if (COMMENT_LISTS.has(path)) {
    return {
      page: 'newcomments',
      params: path === '/noobcomments' ? { type: 'noob' } : {},
    };
  }

  if (path === '/latest') {
    return {
      page: 'newcomments',
      params: { id: sp.get('id') ?? '' },
    };
  }

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
  if (path === '/formatdoc') return { page: 'formatdoc', params: {} };
  if (path === '/lists') return { page: 'lists', params: {} };
  if (path === '/topcolors') return { page: 'topcolors', params: {} };
  if (path === '/leaders') return { page: 'leaders', params: {} };
  if (path === '/delete-confirm') return { page: 'delete-confirm', params: {} };
  if (AUTH_PAGES.has(path)) return { page: 'login', params: {} };
  if (STATIC_PAGES.has(path)) return { page: 'static', params: {} };

  // Catch-all
  return { page: 'static', params: {} };
}
