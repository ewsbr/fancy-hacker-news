<script setup lang="ts">
import { useTheme, type ThemeName } from '@/state/theme';

const { theme, setTheme } = useTheme();

const themes: { name: ThemeName; label: string }[] = [
  { name: 'light', label: 'Light Theme' },
  { name: 'dark', label: 'Dark Theme' },
  { name: 'nord', label: 'Nord Theme' },
  { name: 'amoled', label: 'AMOLED Theme' },
];
</script>

<template>
  <div class="theme-toggle">
    <button
      v-for="item in themes"
      :key="item.name"
      type="button"
      class="theme-toggle__button"
      :class="[
        `theme-toggle__button--${item.name}`,
        { 'theme-toggle__button--active': theme === item.name },
      ]"
      :aria-pressed="theme === item.name"
      :aria-label="item.label"
      @click="setTheme(item.name)"
    >
    </button>
  </div>
</template>

<style scoped lang="scss">
.theme-toggle {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-code-bg);
}

.theme-toggle__button {
  position: relative;
  width: 16px;
  height: 16px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.1);
  cursor: pointer;

  &::before {
    content: '';
    position: absolute;
    top: -1px;
    left: 50%;
    transform: translateX(-50%);
    border-width: 4px 4px 0 4px;
    border-style: solid;
    border-color: transparent;
  }

  &--active::before {
    border-top-color: var(--color-accent);
  }

  &--light {
    background: #f6f6ef;
  }

  &--dark {
    background: #1a1a1a;
  }

  &--nord {
    background: #2e3440;
  }

  &--amoled {
    background: #000000;
  }
}
</style>
