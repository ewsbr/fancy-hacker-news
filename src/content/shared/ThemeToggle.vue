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
  <div class="theme-toggle-group">
    <button
      v-for="item in themes"
      :key="item.name"
      type="button"
      class="theme-btn"
      :class="[item.name, { 'is-active': theme === item.name }]"
      :aria-pressed="theme === item.name"
      :aria-label="item.label"
      @click="setTheme(item.name)"
    >
    </button>
  </div>
</template>
