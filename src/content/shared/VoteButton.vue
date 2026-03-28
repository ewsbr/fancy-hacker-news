<script setup lang="ts">
import { Triangle } from 'lucide-vue-next';

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
    <Triangle :size="12" fill="currentColor" :stroke-width="0" />
  </a>
  <span v-else class="vote-btn vote-btn--inactive" aria-hidden="true">
    <Triangle :size="12" fill="currentColor" :stroke-width="0" />
  </span>
</template>

<style scoped lang="scss">
.vote-btn {
  display: flex;
  align-items: center;
  color: var(--color-text-muted);
  transition: color 0.15s ease;
  margin-top: 6px;

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
