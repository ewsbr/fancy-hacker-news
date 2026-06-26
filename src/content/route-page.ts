import type { Component } from 'vue';
import CommentsPage from '@/content/pages/CommentsPage.vue';
import DeleteConfirmPage from '@/content/pages/DeleteConfirmPage.vue';
import FormatDocPage from '@/content/pages/FormatDocPage.vue';
import LeadersPage from '@/content/pages/LeadersPage.vue';
import ListsPage from '@/content/pages/ListsPage.vue';
import LoginPage from '@/content/pages/LoginPage.vue';
import NewCommentsPage from '@/content/pages/NewCommentsPage.vue';
import NotFoundPage from '@/content/pages/NotFoundPage.vue';
import ReplyPage from '@/content/pages/ReplyPage.vue';
import StaticPage from '@/content/pages/StaticPage.vue';
import StoriesPage from '@/content/pages/StoriesPage.vue';
import SubmitPage from '@/content/pages/SubmitPage.vue';
import ThreadsPage from '@/content/pages/ThreadsPage.vue';
import TopColorsPage from '@/content/pages/TopColorsPage.vue';
import UserPage from '@/content/pages/UserPage.vue';
import type { ParsedDeleteConfirmPage } from '@/parsers/delete-confirm';
import { parseDeleteConfirmPage } from '@/parsers/delete-confirm';
import type { ParsedItemPage } from '@/parsers/item';
import { parseItemPage } from '@/parsers/item';
import type { ParsedLeadersPage } from '@/parsers/leaders';
import { parseLeadersPage } from '@/parsers/leaders';
import type { ParsedListsPage } from '@/parsers/lists';
import { parseListsPage } from '@/parsers/lists';
import type { ParsedLoginPage } from '@/parsers/login';
import { parseLoginPage } from '@/parsers/login';
import type { ParsedNewComments } from '@/parsers/new-comments';
import { parseNewComments } from '@/parsers/new-comments';
import type { ParsedReplyPage } from '@/parsers/reply';
import { parseReplyPage } from '@/parsers/reply';
import type { ParsedStaticPage } from '@/parsers/static';
import { parseStaticPage } from '@/parsers/static';
import type { ParsedStoryList } from '@/parsers/story-list';
import { parseStoryList } from '@/parsers/story-list';
import type { ParsedSubmitPage } from '@/parsers/submit';
import { parseSubmitPage } from '@/parsers/submit';
import type { ParsedThreadsPage } from '@/parsers/threads';
import { parseThreadsPage } from '@/parsers/threads';
import type { ParsedTopColorsPage } from '@/parsers/top-colors';
import { parseTopColorsPage } from '@/parsers/top-colors';
import type { ParsedUserPage } from '@/parsers/user';
import { parseUserPage } from '@/parsers/user';
import type { PageName, RouteDescriptor, RouteForPage } from '@/router';

interface RoutePageDataByPage {
  stories: ParsedStoryList;
  item: ParsedItemPage;
  login: ParsedLoginPage;
  static: ParsedStaticPage | ParsedSubmitPage;
  user: ParsedUserPage;
  threads: ParsedThreadsPage;
  newcomments: ParsedNewComments;
  submitted: ParsedStoryList;
  hidden: ParsedStoryList;
  favorites: ParsedStoryList | ParsedNewComments;
  upvoted: ParsedStoryList | ParsedNewComments;
  submit: ParsedSubmitPage | ParsedLoginPage;
  reply: ParsedReplyPage | ParsedLoginPage;
  formatdoc: ParsedStaticPage;
  leaders: ParsedLeadersPage;
  lists: ParsedListsPage;
  topcolors: ParsedTopColorsPage;
  'delete-confirm': ParsedDeleteConfirmPage;
  notfound: null;
}

export type RoutePageData = RoutePageDataByPage[PageName];

export type ParsedRoutePage = {
  [Page in PageName]: {
    route: RouteForPage<Page>;
    pageData: RoutePageDataByPage[Page];
    component: Component;
  }
}[PageName];

interface RouteParseContext<Route extends RouteDescriptor> {
  route: Route;
  location: Location;
}

interface RouteHandler<Page extends PageName> {
  parse: (doc: Document, context: RouteParseContext<RouteForPage<Page>>) => RoutePageDataByPage[Page];
  component: (pageData: RoutePageDataByPage[Page], context: RouteParseContext<RouteForPage<Page>>) => Component;
}

type RouteHandlerTable = {
  [Page in PageName]: RouteHandler<Page>;
};

type RuntimeRouteHandler = {
  parse: (doc: Document, context: RouteParseContext<RouteDescriptor>) => RoutePageData;
  component: (pageData: RoutePageData, context: RouteParseContext<RouteDescriptor>) => Component;
};

const UPVOTED_PARSER_OPTIONS = { preferredVoteDirection: 'up' as const };

type UserCollectionRoute = RouteForPage<'favorites'> | RouteForPage<'upvoted'>;
type SubmitRouteData = RoutePageDataByPage['submit'];
type ReplyRouteData = RoutePageDataByPage['reply'];
type StaticRouteData = RoutePageDataByPage['static'];

function isLoginPageData(pageData: SubmitRouteData | ReplyRouteData): pageData is ParsedLoginPage {
  if (!('variant' in pageData)) {
    return false;
  }

  return 'forms' in pageData && 'title' in pageData;
}

function isSubmitPageData(pageData: StaticRouteData): pageData is ParsedSubmitPage {
  if (!('isLoggedOut' in pageData)) {
    return false;
  }

  return 'form' in pageData && 'warningMessage' in pageData;
}

function parseSubmitOrLoginPage(doc: Document): SubmitRouteData {
  const submitPage = parseSubmitPage(doc);
  return submitPage.form ? submitPage : parseLoginPage(doc);
}

function parseReplyOrLoginPage(doc: Document): ReplyRouteData {
  const replyPage = parseReplyPage(doc);
  return replyPage.isLoggedOut ? parseLoginPage(doc) : replyPage;
}

function parseStaticOrSubmitPage(doc: Document, location: Location): StaticRouteData {
  if (location.pathname === '/x') {
    const submitPage = parseSubmitPage(doc);
    if (submitPage.form) {
      return submitPage;
    }
  }

  return parseStaticPage(doc);
}

function parseUserCollectionPage(
  doc: Document,
  context: RouteParseContext<UserCollectionRoute>,
): ParsedStoryList | ParsedNewComments {
  const parserOptions = context.route.page === 'upvoted' ? UPVOTED_PARSER_OPTIONS : undefined;
  return context.route.params.comments === 't'
    ? parseNewComments(doc, parserOptions)
    : parseStoryList(doc, parserOptions);
}

function getUserCollectionComponent(
  _pageData: ParsedStoryList | ParsedNewComments,
  context: RouteParseContext<UserCollectionRoute>,
): Component {
  return context.route.params.comments === 't' ? NewCommentsPage : StoriesPage;
}

const ROUTE_HANDLERS = {
  stories: {
    parse: doc => parseStoryList(doc),
    component: () => StoriesPage,
  },
  item: {
    parse: (doc, context) => parseItemPage(doc, {
      initialHashTargetId: context.location.hash.slice(1) || null,
    }),
    component: () => CommentsPage,
  },
  login: {
    parse: doc => parseLoginPage(doc),
    component: () => LoginPage,
  },
  static: {
    parse: (doc, context) => parseStaticOrSubmitPage(doc, context.location),
    component: pageData => isSubmitPageData(pageData) ? SubmitPage : StaticPage,
  },
  user: {
    parse: doc => parseUserPage(doc),
    component: () => UserPage,
  },
  threads: {
    parse: doc => parseThreadsPage(doc),
    component: () => ThreadsPage,
  },
  newcomments: {
    parse: doc => parseNewComments(doc),
    component: () => NewCommentsPage,
  },
  submitted: {
    parse: doc => parseStoryList(doc),
    component: () => StoriesPage,
  },
  hidden: {
    parse: doc => parseStoryList(doc),
    component: () => StoriesPage,
  },
  favorites: {
    parse: parseUserCollectionPage,
    component: getUserCollectionComponent,
  },
  upvoted: {
    parse: parseUserCollectionPage,
    component: getUserCollectionComponent,
  },
  submit: {
    parse: doc => parseSubmitOrLoginPage(doc),
    component: pageData => isLoginPageData(pageData) ? LoginPage : SubmitPage,
  },
  reply: {
    parse: doc => parseReplyOrLoginPage(doc),
    component: pageData => isLoginPageData(pageData) ? LoginPage : ReplyPage,
  },
  formatdoc: {
    parse: doc => parseStaticPage(doc),
    component: () => FormatDocPage,
  },
  leaders: {
    parse: doc => parseLeadersPage(doc),
    component: () => LeadersPage,
  },
  lists: {
    parse: doc => parseListsPage(doc),
    component: () => ListsPage,
  },
  topcolors: {
    parse: doc => parseTopColorsPage(doc),
    component: () => TopColorsPage,
  },
  'delete-confirm': {
    parse: doc => parseDeleteConfirmPage(doc),
    component: () => DeleteConfirmPage,
  },
  notfound: {
    parse: () => null,
    component: () => NotFoundPage,
  },
} satisfies RouteHandlerTable;

export function parseRoutePage(route: RouteDescriptor, doc: Document, location: Location): ParsedRoutePage {
  const context = { route, location };
  const handler = ROUTE_HANDLERS[route.page] as unknown as RuntimeRouteHandler;
  const pageData = handler.parse(doc, context);

  return {
    route,
    pageData,
    component: handler.component(pageData, context),
  } as ParsedRoutePage;
}
