<script setup lang="ts">
import { inject, computed, type Component } from 'vue';
import type { RouteDescriptor } from '@/router';
import AppShell from './layout/AppShell.vue';
import StoriesPage from './pages/StoriesPage.vue';
import ItemPage from './pages/ItemPage.vue';
import LoginPage from './pages/LoginPage.vue';
import StaticPage from './pages/StaticPage.vue';

const route = inject<RouteDescriptor>('route')!;

const PAGE_MAP: Record<string, Component> = {
  stories: StoriesPage,
  item: ItemPage,
  login: LoginPage,
  static: StaticPage,
};

const pageComponent = computed(() => PAGE_MAP[route.page] ?? StaticPage);
</script>

<template>
  <AppShell>
    <component :is="pageComponent" />
  </AppShell>
</template>
