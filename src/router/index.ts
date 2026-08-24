/**
 * Pure URL -> route resolver and typed route contract.
 */

const STORY_TYPE = {
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
} as const;

type StoryPath = keyof typeof STORY_TYPE;
export type StoryListType = typeof STORY_TYPE[StoryPath];

interface CommonRouteParams {
  type: string;
  site: string;
  h: string;
  id: string;
  goto: string;
  comments: string;
  path: string;
}

type RouteParams<Params extends Partial<CommonRouteParams> = Partial<CommonRouteParams>>
  = Params & Partial<Omit<CommonRouteParams, keyof Params>>;

interface RouteByPage {
  'stories': {
    page: 'stories';
    params: RouteParams<{ type: StoryListType; site?: string; h?: string }>;
  };
  'item': {
    page: 'item';
    params: RouteParams<{ id: string }>;
  };
  'login': {
    page: 'login';
    params: RouteParams;
  };
  'static': {
    page: 'static';
    params: RouteParams;
  };
  'user': {
    page: 'user';
    params: RouteParams<{ id: string }>;
  };
  'threads': {
    page: 'threads';
    params: RouteParams<{ id: string }>;
  };
  'newcomments': {
    page: 'newcomments';
    params: RouteParams<{ type?: 'noob'; id?: string }>;
  };
  'submitted': {
    page: 'submitted';
    params: RouteParams<{ id: string }>;
  };
  'hidden': {
    page: 'hidden';
    params: RouteParams<{ id: string }>;
  };
  'favorites': {
    page: 'favorites';
    params: RouteParams<{ id: string; comments?: string }>;
  };
  'upvoted': {
    page: 'upvoted';
    params: RouteParams<{ id: string; comments?: string }>;
  };
  'submit': {
    page: 'submit';
    params: RouteParams;
  };
  'reply': {
    page: 'reply';
    params: RouteParams<{ id: string; goto: string }>;
  };
  'formatdoc': {
    page: 'formatdoc';
    params: RouteParams;
  };
  'leaders': {
    page: 'leaders';
    params: RouteParams;
  };
  'lists': {
    page: 'lists';
    params: RouteParams;
  };
  'topcolors': {
    page: 'topcolors';
    params: RouteParams;
  };
  'delete-confirm': {
    page: 'delete-confirm';
    params: RouteParams;
  };
  'notfound': {
    page: 'notfound';
    params: RouteParams<{ path: string }>;
  };
}

export type PageName = keyof RouteByPage;
export type RouteDescriptor = RouteByPage[PageName];
export type RouteForPage<Page extends PageName> = RouteByPage[Page];

const COMMENT_LISTS = new Set([
  '/newcomments',
  '/noobcomments',
  '/bestcomments',
  '/highlights',
]);

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

const USER_LISTS = new Map<string, 'submitted' | 'threads' | 'hidden'>([
  ['/submitted', 'submitted'],
  ['/threads', 'threads'],
  ['/hidden', 'hidden'],
]);

function getStoryListType(path: string): StoryListType | null {
  return Object.hasOwn(STORY_TYPE, path)
    ? STORY_TYPE[path as StoryPath]
    : null;
}

export function resolveRoute(loc: Location): RouteDescriptor {
  const path = loc.pathname;
  const sp = new URLSearchParams(loc.search);
  const storyType = getStoryListType(path);

  if (storyType !== null) {
    const params: RouteByPage['stories']['params'] = { type: storyType };
    const site = sp.get('site');
    if (site !== null) {
      params.site = site;
    }
    const hours = sp.get('h');
    if (path === '/best' && hours !== null) {
      params.h = hours;
    }
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

  if (path === '/item') {
    return { page: 'item', params: { id: sp.get('id') ?? '' } };
  }
  if (path === '/reply') {
    return { page: 'reply', params: { id: sp.get('id') ?? '', goto: sp.get('goto') ?? '' } };
  }
  if (path === '/user') {
    return { page: 'user', params: { id: sp.get('id') ?? '' } };
  }

  const userListPage = USER_LISTS.get(path);
  if (userListPage) {
    return { page: userListPage, params: { id: sp.get('id') ?? '' } };
  }

  if (path === '/favorites' || path === '/upvoted') {
    const params: RouteByPage['favorites']['params'] = { id: sp.get('id') ?? '' };
    const comments = sp.get('comments');
    if (comments !== null) {
      params.comments = comments;
    }
    return { page: path === '/favorites' ? 'favorites' : 'upvoted', params };
  }

  if (path === '/submit') {
    return { page: 'submit', params: {} };
  }
  if (path === '/formatdoc') {
    return { page: 'formatdoc', params: {} };
  }
  if (path === '/lists') {
    return { page: 'lists', params: {} };
  }
  if (path === '/topcolors') {
    return { page: 'topcolors', params: {} };
  }
  if (path === '/leaders') {
    return { page: 'leaders', params: {} };
  }
  if (path === '/delete-confirm') {
    return { page: 'delete-confirm', params: {} };
  }
  if (AUTH_PAGES.has(path)) {
    return { page: 'login', params: {} };
  }
  if (STATIC_PAGES.has(path)) {
    return { page: 'static', params: {} };
  }

  // Catch-all
  return { page: 'static', params: {} };
}

export function makeNotFoundRoute(loc: Location): RouteForPage<'notfound'> {
  return {
    page: 'notfound',
    params: { path: loc.pathname + loc.search },
  };
}
