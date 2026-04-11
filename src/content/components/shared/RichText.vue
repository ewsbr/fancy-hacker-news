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
  font-size: 1rem;
  line-height: 1.6;
  word-break: break-word;

  :deep(p) {
    margin-top: 10px;
  }

  &--starts-with-paragraph {
    :deep(p:first-child) {
      margin-top: 0;
    }
  }

  :deep(pre) {
    background: var(--color-code-bg);
    border: 1px solid var(--color-border);
    padding: 8px 12px;
    margin-top: 10px;
    margin-bottom: 10px;
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
    margin: 10px 0;
    padding: 2px 12px;
    border-left: 3px solid var(--color-text-muted);
    background: var(--color-quote-bg);

    p {
      margin-top: 6px;
      &:first-child {
        margin-top: 0;
      }
    }
  }
}
</style>
