<script setup lang="ts">
import { inject } from 'vue';
import type { ParsedListsPage } from '@/parsers/lists';

const page = inject<ParsedListsPage>('pageData')!;
</script>

<template>
  <div class="lists-page">
    <h1 class="lists-page__title">Lists</h1>

    <div class="lists-page__card hn-content-card">
      <div
        v-for="entry in page.entries"
        :key="entry.href"
        class="lists-page__row"
      >
        <a class="lists-page__name" :href="entry.href">{{ entry.name }}</a>
        <span class="lists-page__sep" aria-hidden="true">—</span>
        <div class="lists-page__desc" v-html="entry.descriptionHtml" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.lists-page {
  padding: 2rem 0;
  max-width: 44rem;

  &__title {
    margin-bottom: 1.25rem;
    font-family: var(--font-title);
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text);
  }

  &__row {
    display: flex;
    align-items: baseline;
    gap: 0.6rem;
    padding: 0.45rem 0.75rem;
    border-bottom: 1px solid var(--color-border);

    &:last-child {
      border-bottom: none;
    }

    &:nth-child(even) {
      background: color-mix(in srgb, var(--color-surface) 96%, var(--color-text) 4%);
    }

    &:hover {
      background: color-mix(in srgb, var(--color-surface) 93%, var(--color-text) 7%);
    }
  }

  &__name {
    font-family: var(--font-mono);
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-accent);
    text-decoration: none;
    min-width: 8rem;
    flex-shrink: 0;

    &:hover {
      text-decoration: underline;
    }
  }

  &__sep {
    color: var(--color-text-muted);
    flex-shrink: 0;
    user-select: none;
  }

  &__desc {
    font-size: 0.875rem;
    color: var(--color-text-muted);

    :deep(a) {
      color: var(--color-accent);

      &:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
