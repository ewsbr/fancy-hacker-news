<script setup lang="ts">
import { inject } from 'vue';
import StripedTableCard from '@/content/ui/helpers/StripedTableCard.vue';
import type { ParsedLeadersPage } from '@/parsers/leaders';

const page = inject<ParsedLeadersPage>('pageData')!;

function formatKarma(n: number): string {
  return n.toLocaleString('en-US');
}
</script>

<template>
  <div class="leaders-page">
    <h1 class="leaders-page__title">Leaders</h1>

    <StripedTableCard v-if="page.entries.length" class="leaders-page__card">
      <div
        v-for="entry in page.entries"
        :key="entry.rank"
        class="leaders-page__entry striped-table-card__row"
        :class="{ 'leaders-page__entry--top10': entry.karma === null }"
      >
        <span class="leaders-page__rank">{{ entry.rank }}</span>
        <a
          class="leaders-page__user"
          :href="`/user?id=${entry.username}`"
        >{{ entry.username }}</a>
        <span class="leaders-page__karma">
          {{ entry.karma !== null ? formatKarma(entry.karma) : '—' }}
        </span>
      </div>
    </StripedTableCard>
    <div v-else class="leaders-page__empty-state hn-content-card hn-empty-state">
      No leaders found.
    </div>
  </div>
</template>

<style scoped lang="scss">
.leaders-page {
  padding: 2rem 0;
  max-width: 44rem;

  &__title {
    margin-bottom: 1.25rem;
    font-family: var(--font-title);
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text);
  }

  &__card,
  &__empty-state {
    max-width: 44rem;
  }

  &__entry {
    display: grid;
    grid-template-columns: 2rem minmax(0, 1fr) auto;
    align-items: baseline;
    gap: 0 0.75rem;
    padding: 0.45rem 0.75rem;

    &--top10 .leaders-page__rank {
      color: var(--color-accent);
      font-weight: 600;
    }

    &--top10 .leaders-page__user {
      font-weight: 600;
    }
  }

  &__rank {
    font-size: 0.8125rem;
    color: var(--color-text-muted);
    font-variant-numeric: tabular-nums;
  }

  &__user {
    min-width: 0;
    font-size: 0.9375rem;
    color: var(--color-accent);

    &:hover {
      text-decoration: underline;
    }
  }

  &__karma {
    font-size: 0.8125rem;
    color: var(--color-text-muted);
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
}
</style>
