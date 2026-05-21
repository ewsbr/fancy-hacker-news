<script setup lang="ts">
withDefaults(defineProps<{
  activeHours?: string;
}>(), {
  activeHours: '48',
});

const bestRangeLinks = [
  { hours: 2, label: '2h' },
  { hours: 6, label: '6h' },
  { hours: 12, label: '12h' },
  { hours: 24, label: '1d' },
  { hours: 48, label: '2d' },
  { hours: 168, label: '7d' },
] as const;
</script>

<template>
  <aside class="best-range-notice" aria-label="Best stories range shortcuts">
    <span class="best-range-notice__label">Most-upvoted stories</span>
    <nav class="best-range-notice__ranges" aria-label="Story time ranges">
      <a
        v-for="range in bestRangeLinks"
        :key="range.hours"
        class="best-range-notice__range"
        :class="{ 'best-range-notice__range--active': activeHours === String(range.hours) }"
        :href="`best?h=${range.hours}`"
        :aria-current="activeHours === String(range.hours) ? 'page' : undefined"
      >
        {{ range.label }}
      </a>
    </nav>
  </aside>
</template>

<style scoped lang="scss">
.best-range-notice {
  display: flex;
  align-items: center;
  gap: 8px 12px;
  margin-bottom: 6px;
  padding: 6px 9px;
  border-left: 3px solid var(--color-border);
  border-radius: 0 2px 2px 0;
  background: var(--color-quote-bg);
  color: var(--color-text-muted);
  font-size: 0.88rem;
  line-height: 1.4;

  &__label {
    flex: 0 1 auto;
  }

  &__ranges {
    display: flex;
    flex: 1 1 auto;
    flex-wrap: wrap;
    gap: 6px;
  }

  &__range {
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    padding: 0 9px;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background: var(--color-surface);
    color: var(--color-accent);
    font-family: var(--font-mono);
    text-decoration: none;

    &:hover {
      border-color: var(--color-accent);
      text-decoration: underline;
    }

    &--active {
      border-color: var(--color-accent);
      background: var(--color-accent-surface);
      color: var(--color-text);
    }
  }
}

@media (max-width: 640px) {
  .best-range-notice {
    align-items: flex-start;
    flex-direction: column;
    gap: 6px;
    padding: 7px 9px;

    &__ranges {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 7px;
    }

    &__range {
      justify-content: center;
      min-height: 34px;
      padding: 0 8px;
    }
  }
}
</style>
