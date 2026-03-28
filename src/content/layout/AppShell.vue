<script setup lang="ts">
import SiteHeader from './SiteHeader.vue';
import SiteFooter from './SiteFooter.vue';
</script>

<template>
  <div class="app-shell">
    <SiteHeader />
    <main class="main-content">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>
