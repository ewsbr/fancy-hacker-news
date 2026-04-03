<script setup lang="ts">
withDefaults(defineProps<{
  content: string;
  position?: 'top' | 'right';
}>(), {
  position: 'top',
});
</script>

<template>
  <span class="tooltip" tabindex="0" :data-position="position">
    <slot />
    <span class="tooltip__bubble" role="tooltip">{{ content }}</span>
  </span>
</template>

<style scoped lang="scss">
.tooltip {
  position: relative;
  display: inline-flex;
  align-items: center;
  cursor: help;

  &__bubble {
    position: absolute;
    background: var(--color-text);
    color: var(--color-bg);
    padding: 0.35rem 0.6rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 400;
    line-height: 1.4;
    max-width: 220px;
    white-space: normal;
    text-align: left;
    pointer-events: none;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.15s ease, visibility 0.15s ease;
    z-index: 1000;
  }

  &[data-position='top'] .tooltip__bubble {
    bottom: calc(100% + 6px);
    left: 50%;
    transform: translateX(-50%);

    &::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 4px solid transparent;
      border-top-color: var(--color-text);
    }
  }

  &[data-position='right'] .tooltip__bubble {
    left: calc(100% + 6px);
    top: 50%;
    transform: translateY(-50%);

    &::after {
      content: '';
      position: absolute;
      right: 100%;
      top: 50%;
      transform: translateY(-50%);
      border: 4px solid transparent;
      border-right-color: var(--color-text);
    }
  }

  &:hover .tooltip__bubble,
  &:focus .tooltip__bubble {
    opacity: 1;
    visibility: visible;
  }
}
</style>
