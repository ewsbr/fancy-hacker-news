<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  html: string;
}>();

const startsWithParagraph = computed(() => /^<p[\s>]/i.test(props.html.trim()));
</script>

<template>
  <div
    class="rich-text"
    :class="{ 'rich-text--starts-with-paragraph': startsWithParagraph }"
    v-html="html"
  ></div>
</template>

<style scoped lang="scss">
.rich-text {
  font-size: 0.95rem;
  line-height: 1.6;
  word-break: break-word;

  :deep(p) {
    margin-top: 0.65rem;
  }

  &--starts-with-paragraph {
    :deep(p:first-child) {
      margin-top: 0;
    }
  }

  :deep(pre) {
    background: var(--color-code-bg);
    border: 1px solid var(--color-border);
    padding: 0.5rem 0.75rem;
    margin-top: 0.6rem;
    margin-bottom: 0.6rem;
    border-radius: 4px;
    overflow-x: auto;
    overflow-y: hidden;
    font-family: var(--font-mono);
    font-size: 0.825rem;
    line-height: 1.45;
    max-width: 100%;
    scrollbar-width: thin;
    scrollbar-color: var(--color-border) transparent;
    display: block;
  }

  :deep(a) {
    text-decoration: underline;
    &:hover {
      color: var(--color-accent);
    }
  }

  :deep(blockquote) {
    margin: 0.65rem 0;
    padding: 0.15rem 0.75rem;
    border-left: 3px solid var(--color-text-muted);
    background: var(--color-quote-bg);

    p {
      margin-top: 0.35rem;
      &:first-child {
        margin-top: 0;
      }
    }
  }
}
</style>
