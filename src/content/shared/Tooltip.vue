<script setup lang="ts">
import { computed } from 'vue';
import { TooltipContent, TooltipPortal, TooltipRoot, TooltipTrigger } from 'reka-ui';

const props = withDefaults(defineProps<{
  content: string;
  position?: 'top' | 'right';
}>(), {
  position: 'top',
});

const side = computed(() => props.position === 'right' ? 'right' : 'top');
const portalTarget = document.getElementById('fancy-hn-root');
</script>

<template>
  <TooltipRoot :delay-duration="100">
    <TooltipTrigger class="tooltip__trigger">
      <slot />
    </TooltipTrigger>

    <TooltipPortal defer :to="portalTarget ?? undefined" :disabled="!portalTarget">
      <TooltipContent
        class="tooltip__content"
        :side="side"
        align="center"
        :side-offset="10"
        :collision-padding="12"
        position-strategy="fixed"
      >
        {{ props.content }}
      </TooltipContent>
    </TooltipPortal>
  </TooltipRoot>
</template>

<style lang="scss">
.tooltip__trigger {
  appearance: none;
  border: 0;
  background: transparent;
  padding: 0;
  margin: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: help;
  color: inherit;
  line-height: 1;

  &:focus-visible {
    outline: 2px solid var(--color-focus-ring-strong);
    outline-offset: 3px;
    border-radius: 999px;
  }
}

.tooltip__content {
  z-index: 1000;
  inline-size: max-content;
  max-inline-size: min(22rem, var(--reka-tooltip-content-available-width));
  max-block-size: var(--reka-tooltip-content-available-height);
  overflow: auto;
  background: var(--color-surface);
  color: var(--color-text);
  padding: 0.7rem 0.85rem;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-elevation);
  font-size: 0.8125rem;
  font-weight: 400;
  line-height: 1.55;
  white-space: normal;
  overflow-wrap: anywhere;
  text-align: left;
  pointer-events: none;
  user-select: none;
  transform-origin: var(--reka-tooltip-content-transform-origin);
  animation: tooltip-enter 0.16s ease-out;
}

.tooltip__content[data-side='top'] {
  animation-name: tooltip-enter-top;
}

.tooltip__content[data-side='right'] {
  animation-name: tooltip-enter-right;
}

@keyframes tooltip-enter {
  from {
    opacity: 0;
    transform: scale(0.98);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes tooltip-enter-top {
  from {
    opacity: 0;
    transform: translateY(4px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes tooltip-enter-right {
  from {
    opacity: 0;
    transform: translateX(-4px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}
</style>
