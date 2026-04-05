<script setup lang="ts">
import { Info } from 'lucide-vue-next';

defineProps<{
  html: string;
}>();
</script>

<template>
  <aside class="top-notice">
    <header class="top-notice__header">
      <Info :size="14" class="top-notice__icon" />
      <span class="top-notice__label">Notice</span>
    </header>
    <div class="top-notice__content" v-html="html" />
  </aside>
</template>

<style scoped lang="scss">
.top-notice {
  display: flex;
  flex-direction: column;
  margin: 0.5rem 0 1.5rem;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-top: 3px solid var(--color-accent);
  border-radius: 4px;
  box-shadow: var(--shadow-elevation);
  overflow: hidden;

  &__header {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.75rem 1rem 0.25rem;
    color: var(--color-accent);
    user-select: none;
  }

  &__icon {
    flex-shrink: 0;
  }

  &__label {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  &__content {
    padding: 0.4rem 1rem 1rem;
    color: var(--color-text);
    font-size: 0.95rem;
    line-height: 1.6;

    :deep(a) {
      color: var(--color-accent);
      text-decoration: underline;
      text-decoration-thickness: 1.5px;
      text-underline-offset: 2px;
      transition: color 0.15s ease;

      &:hover {
        color: var(--color-accent-muted);
      }
    }

    :deep(p) {
      margin: 0;
    }

    :deep(p + p) {
      margin-top: 0.85rem;
    }

    :deep(i),
    :deep(em) {
      color: var(--color-text);
      font-style: italic;
    }

    :deep(strong),
    :deep(b) {
      color: var(--color-text);
      font-weight: 700;
    }

    :deep(u) {
      text-decoration-thickness: 1px;
      text-underline-offset: 2px;
    }
  }

  @media (max-width: 640px) {
    margin: 0 0 1.25rem;
    border-left: none;
    border-right: none;
    border-radius: 0;
    box-shadow: none;

    &__header {
      padding: 0.65rem 0.75rem 0.2rem;
    }

    &__content {
      padding: 0.2rem 0.75rem 0.85rem;
      font-size: 0.9rem;
    }
  }
}

// AMOLED overrides
#fancy-hn-root[data-theme="amoled"] .top-notice {
  background: #000000;
  box-shadow: none;
  border-color: #1f1f1f;
}
</style>