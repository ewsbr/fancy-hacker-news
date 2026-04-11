<script setup lang="ts">
import { inject } from 'vue';
import StripedTableCard from '@/content/components/ui/StripedTableCard.vue';
import type { ParsedListsPage } from '@/parsers/lists';

const page = inject<ParsedListsPage>('pageData')!;
</script>

<template>
  <div class="lists-page">
    <h1 class="lists-page__title">Lists</h1>

    <StripedTableCard class="lists-page__card">
      <div
        v-for="entry in page.entries"
        :key="entry.href"
        class="lists-page__entry striped-table-card__row"
      >
        <a class="lists-page__name" :href="entry.href">{{ entry.name }}</a>
        <span class="lists-page__sep" aria-hidden="true">—</span>
        <div class="lists-page__desc" v-html="entry.descriptionHtml" />
      </div>
    </StripedTableCard>
  </div>
</template>

<style scoped lang="scss">
.lists-page {
  padding: 32px 0;
  max-width: 704px;

  &__title {
    margin-bottom: 20px;
    font-family: var(--font-title);
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text);
  }

  &__entry {
    display: flex;
    align-items: baseline;
    gap: 10px;
    padding: 7px 12px;
  }

  &__name {
    font-family: var(--font-mono);
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-accent);
    text-decoration: none;
    min-width: 128px;
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
