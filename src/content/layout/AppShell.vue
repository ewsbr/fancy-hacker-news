<script setup lang="ts">
import SiteHeader from './SiteHeader.vue';
import SiteFooter from './SiteFooter.vue';
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
  margin: 0.5rem auto 0;
  padding: 0 0.5rem;
}
</style>
