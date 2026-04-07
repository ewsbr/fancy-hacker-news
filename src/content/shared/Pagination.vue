<script setup lang="ts">
defineProps<{ href: string | null }>();
</script>

<template>
  <div v-if="href" class="pagination">
    <a :href="href" class="pagination__more" rel="next">More</a>
  </div>
</template>

<style scoped lang="scss">
.pagination {
  border: 1px solid var(--color-border);
  border-radius: 0 0 4px 4px;
  margin-top: -1px;
  background: var(--color-surface);

  @media (max-width: 640px) {
    border-left: none;
    border-right: none;
    border-radius: 0;
    margin-left: -0.5rem;
    margin-right: -0.5rem;
  }

  &__more {
    display: block;
    padding: 0.75rem 0.5rem;
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
