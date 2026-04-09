<script setup lang="ts">
import { inject } from 'vue';
import { Search } from 'lucide-vue-next';
import Keycap from './Keycap.vue';

withDefaults(defineProps<{
  variant?: 'default' | 'quiet';
}>(), {
  variant: 'default',
});

const openSearch = inject<() => void>('openSearch');
</script>

<template>
  <button
    type="button"
    :class="['search-trigger', `search-trigger--${variant}`]"
    @click="openSearch?.()"
  >
    <Search :size="14" class="search-trigger__icon" aria-hidden="true" />
    <span class="search-trigger__placeholder">Search HN…</span>
    <Keycap :platform-modifier="true" :keys="['K']" aria-hidden="true" />
  </button>
</template>

<style scoped lang="scss">
.search-trigger {
  --keycap-text: var(--color-text-muted);
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.38rem 0.75rem 0.38rem 0.6rem;
  border: 1px solid var(--color-border);
  border-radius: 20px;
  background: var(--color-bg);
  color: var(--color-text-muted);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 0.875rem;
  transition: border-color 0.15s ease, background-color 0.15s ease, color 0.15s ease;

  &:hover {
    border-color: var(--color-accent);
    color: var(--color-text);
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus-ring-strong);
    outline-offset: 2px;
  }

  &--quiet {
    padding-inline: 0.7rem;
    border-color: var(--color-divider);
    background: transparent;
  }
}

.search-trigger__icon {
  flex-shrink: 0;
}

.search-trigger__placeholder {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}
</style>
