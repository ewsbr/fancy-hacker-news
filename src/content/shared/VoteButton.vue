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
    <Triangle :size="13" fill="currentColor" :stroke-width="0" />
  </a>
  <span v-else class="vote-btn vote-btn--inactive" aria-hidden="true">
    <Triangle :size="13" fill="currentColor" :stroke-width="0" />
  </span>
</template>

<style scoped lang="scss">
.vote-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  transition: color 0.1s ease;
  margin-top: 6px;

  &::before {
    content: "";
    position: absolute;
    top: -6px;
    left: -6px;
    right: -6px;
    bottom: -6px;

    @media (max-width: 640px) {
      top: -12px;
      left: -12px;
      right: -12px;
      bottom: -12px;
    }
  }

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
