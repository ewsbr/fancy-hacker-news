<script setup lang="ts">
import { LoaderCircle } from 'lucide-vue-next';

defineProps<{
  cover: boolean;
  showIndicator: boolean;
}>();
</script>

<template>
  <div
    class="fragment-loading"
    :class="cover ? 'fragment-loading--cover' : 'fragment-loading--status'"
    role="status"
    aria-live="polite"
    aria-atomic="true"
  >
    <div v-if="showIndicator" class="fragment-loading__message">
      <LoaderCircle class="fragment-loading__spinner" :size="20" aria-hidden="true" />
      <span>Loading comments</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.fragment-loading {
  &--cover {
    position: absolute;
    inset: 0;
    z-index: 2;
    background: var(--color-surface);
    border-radius: inherit;
  }

  &--status {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 200;
    max-width: calc(100% - 32px);
    pointer-events: none;
  }

  &__message {
    position: sticky;
    top: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 24px 16px;
    color: var(--color-text-muted);
    font-size: 0.875rem;
  }

  &--status &__message {
    padding: 10px 16px;
    border: 1px solid var(--color-border);
    border-radius: 8px;
    background: var(--color-surface);
  }

  &__spinner {
    flex-shrink: 0;
    color: var(--color-accent);
    animation: fragment-spin 1s linear infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    &__spinner {
      animation: none;
    }
  }
}

@keyframes fragment-spin {
  to { transform: rotate(360deg); }
}
</style>
