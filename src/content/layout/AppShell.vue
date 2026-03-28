<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import SiteHeader from './SiteHeader.vue';
import SiteFooter from './SiteFooter.vue';

function handleHashLink(e: MouseEvent) {
  const target = e.target as HTMLElement;
  const link = target.closest('a');
  if (!link) return;

  const href = link.getAttribute('href');
  if (href && href.startsWith('#')) {
    const id = href.substring(1);
    const root = link.getRootNode() as ShadowRoot | Document;
    if (!(root instanceof ShadowRoot)) return;

    const el = root.getElementById(id);
    if (el) {
      e.preventDefault();
      // Update fragment for :target support
      window.history.replaceState(null, '', `#${id}`);
      // Standard scrollIntoView() respects scroll-margin-top
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

onMounted(() => {
  window.addEventListener('click', handleHashLink);
});

onUnmounted(() => {
  window.removeEventListener('click', handleHashLink);
});
</script>

<template>
  <div class="app-shell">
    <SiteHeader />
    <main class="app-shell__main">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped lang="scss">
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  background: var(--color-bg);
  color: var(--color-text);
}

.app-shell__main {
  flex: 1;
  width: 100%;
  max-width: 1024px;
  margin: 1.5rem auto 0;
  padding: 0 1rem;
}
</style>
