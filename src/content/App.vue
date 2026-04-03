<script setup lang="ts">
import { inject, computed, type Component } from 'vue';
import type { RouteDescriptor } from '@/router';
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

const route = inject<RouteDescriptor>('route')!;

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
};

const pageComponent = computed(() => {
  if (route.page === 'favorites' || route.page === 'upvoted') {
    return route.params.comments === 't' ? NewCommentsPage : StoriesPage;
  }
  return PAGE_MAP[route.page] ?? StaticPage;
});
</script>

<template>
  <AppShell>
    <component :is="pageComponent" />
  </AppShell>
</template>
