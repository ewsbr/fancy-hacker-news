<script setup lang="ts">
import type { Component } from 'vue';
import { SwitchRoot, SwitchThumb } from 'reka-ui';

defineProps<{
  checked: boolean;
  icon: Component;
  label: string;
}>();

const emit = defineEmits<{
  (event: 'update:checked', checked: boolean): void;
}>();
</script>

<template>
  <SwitchRoot
    :model-value="checked"
    class="feature-switch"
    @update:model-value="emit('update:checked', $event)"
  >
    <span class="feature-switch__icon" aria-hidden="true">
      <component :is="icon" :size="18" />
    </span>
    <span class="feature-switch__label">{{ label }}</span>
    <span class="feature-switch__track" aria-hidden="true">
      <SwitchThumb class="feature-switch__thumb" />
    </span>
  </SwitchRoot>
</template>

<style scoped lang="scss">
.feature-switch {
  min-width: 0;
  min-height: 46px;
  padding: 7px 8px;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  text-align: left;

  &:hover {
    border-color: var(--color-accent-badge-border);
    background: var(--color-accent-surface-subtle);
  }

  &:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
  }

  &__icon {
    width: 30px;
    height: 30px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    background: var(--color-code-bg);
    color: var(--color-accent-muted);
  }

  &__label {
    min-width: 0;
    font-size: 0.88rem;
    font-weight: 700;
  }

  &__track {
    position: relative;
    width: 38px;
    height: 22px;
    border: 1px solid var(--color-border);
    border-radius: 999px;
    background: var(--color-code-bg);
    transition: background 0.15s, border-color 0.15s;

    .feature-switch[data-state="checked"] & {
      border-color: var(--color-accent);
      background: var(--color-accent);
    }
  }

  &__thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: var(--color-text-muted);
    box-shadow: 0 1px 3px rgb(0 0 0 / 0.35);
    transition: transform 0.15s, background 0.15s;

    &[data-state="checked"] {
      transform: translateX(16px);
      background: var(--color-accent-contrast);
    }
  }
}
</style>
