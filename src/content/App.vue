<script setup lang="ts">
import { inject, computed, type Component } from 'vue';
import { TooltipProvider } from 'reka-ui';
import type { RouteDescriptor } from '@/router';
import type { ParsedLoginPage } from '@/parsers/login';
import type { ParsedSubmitPage } from '@/parsers/submit';
import AppShell from './layout/AppShell.vue';
import StoriesPage from './pages/StoriesPage.vue';
import CommentsPage from './pages/CommentsPage.vue';
import LoginPage from './pages/LoginPage.vue';
import StaticPage from './pages/StaticPage.vue';
import UserPage from './pages/UserPage.vue';
import ThreadsPage from './pages/ThreadsPage.vue';
import NewCommentsPage from './pages/NewCommentsPage.vue';
import SubmitPage from './pages/SubmitPage.vue';
import ReplyPage from './pages/ReplyPage.vue';
import FormatDocPage from './pages/FormatDocPage.vue';
import LeadersPage from './pages/LeadersPage.vue';
import ListsPage from './pages/ListsPage.vue';
import TopColorsPage from './pages/TopColorsPage.vue';
import DeleteConfirmPage from './pages/DeleteConfirmPage.vue';

const route = inject<RouteDescriptor>('route')!;
const pageData = inject<unknown>('pageData');

const PAGE_MAP: Record<string, Component> = {
  stories: StoriesPage,
  item: CommentsPage,
  login: LoginPage,
  static: StaticPage,
  user: UserPage,
  threads: ThreadsPage,
  newcomments: NewCommentsPage,
  submitted: StoriesPage,
  hidden: StoriesPage,
  submit: SubmitPage,
  reply: ReplyPage,
  formatdoc: FormatDocPage,
  leaders: LeadersPage,
  lists: ListsPage,
  topcolors: TopColorsPage,
  'delete-confirm': DeleteConfirmPage,
};

function isLoginPageData(value: unknown): value is ParsedLoginPage {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return 'variant' in value && 'forms' in value && 'title' in value;
}

function isSubmitPageData(value: unknown): value is ParsedSubmitPage {
  if (!value || typeof value !== 'object') {
    return false;
  }

  return 'isLoggedOut' in value && 'form' in value && 'warningMessage' in value;
}

const pageComponent = computed(() => {
  if (route.page === 'favorites' || route.page === 'upvoted') {
    return route.params.comments === 't' ? NewCommentsPage : StoriesPage;
  }

  if (route.page === 'submit' && isLoginPageData(pageData)) {
    return LoginPage;
  }

  if (route.page === 'static' && isSubmitPageData(pageData)) {
    return SubmitPage;
  }

  return PAGE_MAP[route.page] ?? StaticPage;
});
</script>

<template>
  <TooltipProvider
    :delay-duration="250"
    :skip-delay-duration="150"
    :disable-hoverable-content="true"
    :content="{ sideOffset: 10, collisionPadding: 12, avoidCollisions: true }"
  >
    <AppShell>
      <component :is="pageComponent" />
    </AppShell>
  </TooltipProvider>
</template>
