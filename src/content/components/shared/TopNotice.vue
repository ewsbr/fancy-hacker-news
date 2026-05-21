<script setup lang="ts">
defineProps<{
  html: string;
}>();
</script>

<template>
  <aside class="top-notice" v-html="html" />
</template>

<style lang="scss">
.top-notice {
  margin-bottom: 6px;
  padding: 5px 9px;
  border-left: 3px solid var(--color-border);
  border-radius: 0 2px 2px 0;
  background: var(--color-quote-bg);
  color: var(--color-text-muted);
  font-size: 0.88rem;
  line-height: 1.5;

  div {
    margin: 0 !important;
  }

  a {
    color: var(--color-accent);

    &:hover {
      text-decoration: underline;
    }
  }

  p {
    margin: 0;
  }

  p + p {
    margin-top: 3px;
  }

  u {
    text-decoration-thickness: 1px;
  }

  i,
  em {
    color: var(--color-text);
  }
}
</style>
