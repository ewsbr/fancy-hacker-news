<script setup lang="ts">
withDefaults(defineProps<{
  href: string | null;
  attached?: boolean;
}>(), {
  attached: false,
});
</script>

<template>
  <div v-if="href" :class="['pagination', { 'pagination--attached': attached }]">
    <a :href="href" class="pagination__more" rel="next" aria-label="More, next page">More</a>
  </div>
</template>

<style scoped lang="scss">
.pagination {
  border: 1px solid var(--color-border);
  border-radius: 0 0 4px 4px;
  margin-top: -1px;
  background: var(--color-surface);

  &--attached {
    margin-top: 0;
    border: 0;
    border-top: 1px solid var(--color-border);
    border-radius: 0;
  }

  @media (max-width: 640px) {
    &:not(.pagination--attached) {
      border-left: none;
      border-right: none;
      border-radius: 0;
      margin-left: -8px;
      margin-right: -8px;
    }
  }

  &__more {
    display: block;
    padding: 12px 8px;
    color: var(--color-accent);
    text-align: center;
    font-weight: 600;

    &:hover {
      background: var(--color-bg);
      text-decoration: none;
    }
  }
}
</style>
