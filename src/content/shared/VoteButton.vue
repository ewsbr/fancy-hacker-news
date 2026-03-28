<script setup lang="ts">
import { ChevronUp } from 'lucide-vue-next';

defineProps<{ href: string | null }>();
</script>

<template>
  <a
    v-if="href"
    :href="href"
    class="vote-btn"
    title="upvote"
    aria-label="upvote"
  >
    <ChevronUp :size="15" :stroke-width="2.5" />
  </a>
  <span v-else class="vote-btn vote-btn--inactive" aria-hidden="true">
    <ChevronUp :size="15" :stroke-width="2.5" />
  </span>
</template>

<style scoped lang="scss">
.vote-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.1rem;
  color: var(--color-text-muted);

  &:hover {
    color: var(--color-accent);
    text-decoration: none;
  }

  &--inactive {
    opacity: 0.2;
    pointer-events: none;
  }
}
</style>
