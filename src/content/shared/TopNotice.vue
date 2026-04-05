<script setup lang="ts">
defineProps<{
  html: string;
}>();
</script>

<template>
  <aside class="top-notice" v-html="html" />
</template>

<style scoped lang="scss">
.top-notice {
  margin-bottom: 0.4rem;
  padding: 0.3rem 0.55rem;
  border-left: 3px solid var(--color-border);
  border-radius: 0 2px 2px 0;
  background: var(--color-quote-bg);
  color: var(--color-text-muted);
  font-size: 0.88rem;
  line-height: 1.5;

  :deep(div) {
    margin: 0 !important;
  }

  :deep(a) {
    color: var(--color-accent);

    &:hover {
      text-decoration: underline;
    }
  }

  :deep(p) {
    margin: 0;
  }

  :deep(p + p) {
    margin-top: 0.2rem;
  }

  :deep(u) {
    text-decoration-thickness: 1px;
  }

  :deep(i),
  :deep(em) {
    color: var(--color-text);
  }
}
</style>