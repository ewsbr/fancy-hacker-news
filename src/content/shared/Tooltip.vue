<script setup lang="ts">
import { computed } from 'vue';
import { TooltipArrow, TooltipContent, TooltipPortal, TooltipRoot, TooltipTrigger } from 'reka-ui';
import { EXTENSION_ROOT_SELECTOR } from '@/content/utils/rootHost';

const props = withDefaults(defineProps<{
  content: string;
  position?: 'top' | 'right';
}>(), {
  position: 'top',
});

const side = computed(() => props.position === 'right' ? 'right' : 'top');
</script>

<template>
  <TooltipRoot :delay-duration="100">
    <TooltipTrigger class="tooltip__trigger">
      <slot />
    </TooltipTrigger>

    <TooltipPortal defer :to="EXTENSION_ROOT_SELECTOR">
      <TooltipContent
        class="tooltip__content"
        :side="side"
        align="center"
        :side-offset="10"
        :collision-padding="12"
        position-strategy="fixed"
      >
        <div class="tooltip__body">
          {{ props.content }}
        </div>

        <TooltipArrow
          class="tooltip__arrow"
          :width="18"
          :height="9"
        >
          <path
            class="tooltip__arrow-fill"
            d="M0 0L6 6L12 0Z"
          />
          <path
            class="tooltip__arrow-stroke"
            d="M0 0L6 6L12 0"
          />
        </TooltipArrow>
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
  color: var(--color-text);
  overflow: visible;
  pointer-events: none;
  user-select: none;
  transform-origin: var(--reka-tooltip-content-transform-origin);
  animation: tooltip-enter 0.16s ease-out;
}

.tooltip__body {
  position: relative;
  z-index: 1;
  max-block-size: var(--reka-tooltip-content-available-height);
  overflow: auto;
  background: var(--color-surface);
  padding: 0.7rem 0.85rem;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  font-size: 0.8125rem;
  font-weight: 400;
  line-height: 1.55;
  white-space: normal;
  overflow-wrap: anywhere;
  text-align: left;
}

.tooltip__arrow {
  fill: var(--color-surface);
}

.tooltip__arrow-fill {
  fill: var(--color-surface);
}

.tooltip__arrow-stroke {
  fill: none;
  stroke: var(--color-border);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1px;
  vector-effect: non-scaling-stroke;
}

.tooltip__content[data-side='top'] {
  animation-name: tooltip-enter-top;
}

.tooltip__content[data-side='top'] .tooltip__arrow {
  transform: translateY(-2px);
}

.tooltip__content[data-side='right'] {
  animation-name: tooltip-enter-right;
}

.tooltip__content[data-side='right'] .tooltip__arrow {
  transform: translateX(-2px);
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
