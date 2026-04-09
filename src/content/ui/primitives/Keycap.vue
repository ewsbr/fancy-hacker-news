<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  keys?: string[];
  platformModifier?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  keys: () => [],
  platformModifier: false,
});

const isMac = typeof navigator !== 'undefined' && /mac/i.test(navigator.platform);

const renderedLabel = computed(() => {
  const parts = [...props.keys];

  if (props.platformModifier) {
    parts.unshift(isMac ? '⌘' : 'Ctrl');
  }

  return parts.join('\u00a0');
});
</script>

<template>
  <kbd class="keycap">
    <template v-if="renderedLabel">{{ renderedLabel }}</template>
    <slot v-else />
  </kbd>
</template>

<style scoped lang="scss">
.keycap {
  display: inline-block;
  padding: 0.1em 0.35em;
  border: 1px solid var(--keycap-border, var(--color-border));
  border-radius: 3px;
  background: var(--keycap-bg, var(--color-surface));
  color: var(--keycap-text, var(--color-text));
  font-family: var(--font-mono);
  font-size: 0.8em;
  line-height: 1.4;
  white-space: nowrap;
}
</style>