<script setup lang="ts">
import { useEventListener } from '@vueuse/core';
import { provide, ref } from 'vue';
import SiteHeader from './SiteHeader.vue';
import SiteFooter from './SiteFooter.vue';
import SearchModal from '@/content/components/layout/SearchModal.vue';
import ScrollToTopButton from '@/content/components/layout/ScrollToTopButton.vue';
import { isSearchShortcutEvent } from '@/content/utils/keyboard';

const searchOpen = ref(false);

function openSearch() {
  if (!searchOpen.value) {
    searchOpen.value = true;
  }
}

provide('openSearch', openSearch);

function onGlobalKeydown(e: KeyboardEvent) {
  if (!isSearchShortcutEvent(e) || searchOpen.value) {
    return;
  }

  e.preventDefault();
  openSearch();
}

useEventListener(document, 'keydown', onGlobalKeydown);
</script>

<template>
  <div class="app-shell">
    <SiteHeader />
    <main class="app-shell__main">
      <slot />
    </main>
    <SiteFooter />
    <ScrollToTopButton />
  </div>

  <SearchModal :open="searchOpen" @update:open="searchOpen = $event" />
</template>

<style scoped lang="scss">
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  background: var(--color-bg);
  color: var(--color-text);

  &__main {
    flex: 1;
    width: 100%;
    max-width: 1024px;
    margin: 8px auto 0;
    padding: 0 8px;

    @media (max-width: 640px) {
      padding: 0 8px;
      margin-left: 0;
      margin-right: 0;
    }
  }
}
</style>
