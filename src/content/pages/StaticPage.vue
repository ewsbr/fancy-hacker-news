<script setup lang="ts">
import { inject } from 'vue';
import type { ParsedStaticPage } from '@/parsers/static';

const page = inject<ParsedStaticPage>('pageData')!;
</script>

<template>
  <div class="static-page">
    <div
      v-if="page.contentHtml"
      class="static-page__content"
      v-html="page.contentHtml"
    />
    <p v-else class="static-page__empty-state">No content found.</p>
  </div>
</template>

<style scoped lang="scss">
.static-page {
  padding: 2rem 0;
  max-width: 48rem;

  &__content {
    color: var(--color-text);

    :deep(img) {
      display: none;
    }

    :deep(a) {
      color: var(--color-accent);

      &:hover {
        text-decoration: underline;
      }
    }

    :deep(p) {
      margin-bottom: 0.75rem;
      line-height: 1.625;
    }

    :deep(h1) {
      margin-bottom: 1.25rem;
      font-family: var(--font-title);
      font-size: 1.25rem;
      font-weight: 700;
    }

    :deep(h2) {
      margin-top: 1.75rem;
      margin-bottom: 0.625rem;
      font-family: var(--font-title);
      font-size: 1rem;
      font-weight: 600;
    }

    :deep(ul),
    :deep(ol) {
      margin-bottom: 0.75rem;
      padding-left: 1.5rem;
    }

    :deep(ul) {
      list-style: disc;
    }

    :deep(ol) {
      list-style: decimal;
    }

    :deep(li) {
      margin-bottom: 0.25rem;
    }

    :deep(pre) {
      margin-bottom: 0.75rem;
      overflow-x: auto;
      padding: 0.75rem 1rem;
      border-radius: 0.125rem;
      background: var(--color-code-bg);
      font-family: var(--font-mono);
      font-size: 0.875rem;
      line-height: 1.625;
    }

    :deep(code) {
      font-family: var(--font-mono);
      font-size: 0.875rem;
    }

    :deep(blockquote) {
      margin: 0.5rem 0;
      padding-left: 1rem;
      border-left: 3px solid var(--color-quote-border);
      color: var(--color-text-muted);
      font-style: italic;
    }
  }

  &__empty-state {
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }
}
</style>
