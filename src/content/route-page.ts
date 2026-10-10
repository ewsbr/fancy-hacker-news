import type { Component } from 'vue';
import type { RouteDescriptor } from '@/router';
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
import { parseDeleteConfirmPage } from '@/parsers/delete-confirm';
import { parseItemPage } from '@/parsers/item';
import { parseLeadersPage } from '@/parsers/leaders';
import { parseListsPage } from '@/parsers/lists';
import { parseLoginPage } from '@/parsers/login';
import { parseNewComments } from '@/parsers/new-comments';
import { parseReplyPage } from '@/parsers/reply';
import { parseStaticPage } from '@/parsers/static';
import { parseStoryList } from '@/parsers/story-list';
import { parseSubmitPage } from '@/parsers/submit';
import { parseThreadsPage } from '@/parsers/threads';
import { parseTopColorsPage } from '@/parsers/top-colors';
import { parseUserPage } from '@/parsers/user';

export interface ParsedRoutePage {
  pageData: object | null;
  component: Component;
}

export function parseRoutePage(route: RouteDescriptor, doc: Document, location: Location): ParsedRoutePage {
  switch (route.page) {
    case 'stories':
    case 'submitted':
    case 'hidden':
      return { pageData: parseStoryList(doc), component: StoriesPage };
    case 'favorites':
    case 'upvoted': {
      const options = route.page === 'upvoted' ? { preferredVoteDirection: 'up' as const } : undefined;
      return route.params.comments === 't'
        ? { pageData: parseNewComments(doc, options), component: NewCommentsPage }
        : { pageData: parseStoryList(doc, options), component: StoriesPage };
    }
    case 'item':
      return {
        pageData: parseItemPage(doc, { initialHashTargetId: location.hash.slice(1) || null }),
        component: CommentsPage,
      };
    case 'login':
      return { pageData: parseLoginPage(doc, location.pathname), component: LoginPage };
    case 'static': {
      // HN renders submit validation errors at /x.
      const submitPage = location.pathname === '/x' ? parseSubmitPage(doc) : null;
      return submitPage?.form
        ? { pageData: submitPage, component: SubmitPage }
        : { pageData: parseStaticPage(doc), component: StaticPage };
    }
    case 'submit': {
      const submitPage = parseSubmitPage(doc);
      return submitPage.form
        ? { pageData: submitPage, component: SubmitPage }
        : { pageData: parseLoginPage(doc, location.pathname), component: LoginPage };
    }
    case 'reply': {
      const replyPage = parseReplyPage(doc);
      return replyPage.isLoggedOut
        ? { pageData: parseLoginPage(doc, location.pathname), component: LoginPage }
        : { pageData: replyPage, component: ReplyPage };
    }
    case 'user':
      return { pageData: parseUserPage(doc), component: UserPage };
    case 'threads':
      return { pageData: parseThreadsPage(doc), component: ThreadsPage };
    case 'newcomments':
      return { pageData: parseNewComments(doc), component: NewCommentsPage };
    case 'formatdoc':
      return { pageData: parseStaticPage(doc), component: FormatDocPage };
    case 'leaders':
      return { pageData: parseLeadersPage(doc), component: LeadersPage };
    case 'lists':
      return { pageData: parseListsPage(doc), component: ListsPage };
    case 'topcolors':
      return { pageData: parseTopColorsPage(doc), component: TopColorsPage };
    case 'delete-confirm':
      return { pageData: parseDeleteConfirmPage(doc), component: DeleteConfirmPage };
    case 'notfound':
      return { pageData: null, component: NotFoundPage };
  }
}
