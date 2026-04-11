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
  padding: 16px 0 32px;
  max-width: 768px;
  margin: 0 auto;

  &__card {
    padding: 24px 28px;

    @media (max-width: 640px) {
      padding: 16px 14px;
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

    :deep(.hn-bookmarklet-cta) {
      display: flex;
      justify-content: center;
      margin: 18px 0 20px;
    }

    :deep(.hn-bookmarklet-link) {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 184px;
      padding: 12px 18px;
      border: 1px solid var(--color-border);
      border-radius: 4px;
      background: var(--color-surface);
      color: var(--color-text);
      font-family: var(--font-title);
      font-size: 0.84rem;
      font-weight: 800;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      text-decoration: none;
      cursor: grab;
      transition: background-color 0.1s ease, color 0.1s ease, border-color 0.1s ease, transform 0.1s ease;

      &:hover {
        background: var(--color-accent);
        border-color: var(--color-accent);
        color: #ffffff;
        text-decoration: none;
        transform: translateY(-1px);
      }

      &:active {
        cursor: grabbing;
        transform: translateY(0);
      }
    }

    :deep(p) {
      margin-bottom: 12px;
      line-height: 1.625;
    }

    :deep(h1) {
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--color-border);
      font-family: var(--font-title);
      font-size: 1.25rem;
      font-weight: 700;
    }

    :deep(h2) {
      margin-top: 24px;
      margin-bottom: 6px;
      padding-bottom: 3px;
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
      margin-bottom: 12px;
      padding-left: 24px;
    }

    :deep(table) {
      width: 100%;
      margin-bottom: 16px;
      border-collapse: separate;
      border-spacing: 0;
      overflow: hidden;
      border: 1px solid var(--color-border);
      border-radius: 0.35rem;
    }

    :deep(td),
    :deep(th) {
      padding: 8px 11px;
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
      min-width: 64px;
    }

    :deep(ul) {
      list-style: disc;
    }

    :deep(ol) {
      list-style: decimal;
    }

    :deep(li) {
      margin-bottom: 4px;
    }

    :deep(pre) {
      margin-bottom: 12px;
      overflow-x: auto;
      padding: 12px 16px;
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
      margin: 8px 0;
      padding-left: 16px;
      border-left: 3px solid var(--color-quote-border);
      color: var(--color-text-muted);
      font-style: italic;
    }

    @media (max-width: 640px) {
      :deep(.hn-bookmarklet-link) {
        width: 100%;
        min-width: 0;
      }
    }
  }

  &__empty-state {
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }
}
</style>
