<script setup lang="ts">
import { computed, inject } from 'vue';
import type { ParsedStaticPage } from '@/parsers/static';

const page = inject<ParsedStaticPage>('pageData')!;

const contentHtml = computed(() =>
  page.contentHtml
    .replace(/<br\s*\/?>/gi, '')
    .replace(/<p[^>]*>\s*<\/p>/gi, '')
);
</script>

<template>
  <div class="static-page">
    <div
      v-if="page.contentHtml"
      class="static-page__card hn-content-card"
    >
      <div
        class="static-page__content"
        v-html="contentHtml"
      />
    </div>
    <p v-else class="static-page__empty-state">No content found.</p>
  </div>
</template>

<style scoped lang="scss">
.static-page {
  padding: 1rem 0 2rem;
  max-width: 48rem;
  margin: 0 auto;

  &__card {
    padding: 1.5rem 1.75rem;

    @media (max-width: 640px) {
      padding: 1rem 0.875rem;
    }
  }

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
      margin-bottom: 1.5rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--color-border);
      font-family: var(--font-title);
      font-size: 1.25rem;
      font-weight: 700;
    }

    :deep(h2) {
      margin-top: 1.5rem;
      margin-bottom: 0.35rem;
      padding-bottom: 0.2rem;
      border-bottom: 1px solid var(--color-border);
      font-family: var(--font-title);
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--color-text);
    }

    :deep(h2:first-child) {
      margin-top: 0;
    }

    :deep(ul),
    :deep(ol) {
      margin-bottom: 0.75rem;
      padding-left: 1.5rem;
    }

    :deep(table) {
      width: 100%;
      margin-bottom: 1rem;
      border-collapse: separate;
      border-spacing: 0;
      overflow: hidden;
      border: 1px solid var(--color-border);
      border-radius: 0.35rem;
    }

    :deep(td),
    :deep(th) {
      padding: 0.5rem 0.7rem;
      border-bottom: 1px solid var(--color-border);
      vertical-align: middle;
      text-align: left;
    }

    :deep(tr:last-child td),
    :deep(tr:last-child th) {
      border-bottom: 0;
    }

    :deep(td[bgcolor]),
    :deep(td[style*="background"]),
    :deep(td[style*="background-color"]) {
      min-width: 4rem;
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
