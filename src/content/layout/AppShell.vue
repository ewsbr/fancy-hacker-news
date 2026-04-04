<script setup lang="ts">
import { onMounted, onUnmounted, provide, ref } from 'vue';
import SiteHeader from './SiteHeader.vue';
import SiteFooter from './SiteFooter.vue';
import SearchModal from '../shared/SearchModal.vue';
import ScrollToTopButton from '../shared/ScrollToTopButton.vue';

const searchOpen = ref(false);

function openSearch() {
  searchOpen.value = true;
}

provide('openSearch', openSearch);

function onGlobalKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    openSearch();
  }
}

onMounted(() => document.addEventListener('keydown', onGlobalKeydown));
onUnmounted(() => document.removeEventListener('keydown', onGlobalKeydown));
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

  <SearchModal v-if="searchOpen" @close="searchOpen = false" />
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
    margin: 0.5rem auto 0;
    padding: 0 0.5rem;
  }
}
</style>
