<script setup lang="ts">
import { inject } from 'vue';
import type { ParsedLeadersPage } from '@/parsers/leaders';

const page = inject<ParsedLeadersPage>('pageData')!;

function formatKarma(n: number): string {
  return n.toLocaleString('en-US');
}
</script>

<template>
  <div class="leaders-page">
    <h1 class="leaders-page__title">Leaders</h1>

    <ol v-if="page.entries.length" class="leaders-list">
      <li
        v-for="entry in page.entries"
        :key="entry.rank"
        class="leaders-list__row"
        :class="{ 'leaders-list__row--top10': entry.karma === null }"
      >
        <span class="leaders-list__rank">{{ entry.rank }}</span>
        <a
          class="leaders-list__user"
          :href="`/user?id=${entry.username}`"
        >{{ entry.username }}</a>
        <span class="leaders-list__karma">
          {{ entry.karma !== null ? formatKarma(entry.karma) : '—' }}
        </span>
      </li>
    </ol>
    <div v-else class="leaders-page__empty-state hn-content-card hn-empty-state">
      No leaders found.
    </div>
  </div>
</template>

<style scoped lang="scss">
.leaders-page {
  padding: 2rem 0;

  &__title {
    margin-bottom: 1.5rem;
    font-family: var(--font-title);
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-text);
  }

  &__empty-state {
    max-width: 28rem;
  }
}

.leaders-list {
  display: flex;
  flex-direction: column;
  list-style: none;
  padding: 0;
  margin: 0;
  max-width: 28rem;

  &__row {
    display: grid;
    grid-template-columns: 2.5rem 1fr auto;
    align-items: baseline;
    gap: 0 0.75rem;
    padding: 0.3125rem 0;
    border-bottom: 1px solid var(--color-border);

    &:first-child {
      border-top: 1px solid var(--color-border);
    }

    &--top10 .leaders-list__rank {
      color: var(--color-accent);
      font-weight: 600;
    }

    &--top10 .leaders-list__user {
      font-weight: 600;
    }
  }

  &__rank {
    font-size: 0.8125rem;
    color: var(--color-text-muted);
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  &__user {
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
