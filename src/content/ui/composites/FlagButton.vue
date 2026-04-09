<script setup lang="ts">
import { computed } from 'vue';
import type { FlagActionTarget } from '@/content/composables/useHnActions';
import { useHnActions } from '@/content/composables/useHnActions';

const props = defineProps<{
  href: string;
  /** Whether this is an unflag action (detected from URL containing un=t) */
  isUnflag?: boolean;
  flagTarget?: FlagActionTarget | null;
}>();

const { isBusy, submitFlag } = useHnActions();

const isUnflagAction = computed(
  () => props.flagTarget?.isFlagged ?? props.isUnflag ?? props.href.includes('un=t'),
);

function handleClick(event: MouseEvent) {
  const action = isUnflagAction.value ? 'unflag' : 'flag';
  if (!window.confirm(`Are you sure you want to ${action} this?`)) {
    event.preventDefault();
    return;
  }

  if (!props.flagTarget) {
    return;
  }

  event.preventDefault();
  void submitFlag(props.flagTarget);
}
</script>

<template>
  <a
    :href="href"
    class="flag-button"
    :class="{ 'flag-button--busy': isBusy }"
    :aria-disabled="isBusy ? 'true' : undefined"
    @click="handleClick"
  >
    {{ isUnflagAction ? 'unflag' : 'flag' }}
  </a>
</template>

<style scoped lang="scss">
.flag-button {
  color: inherit;
  text-decoration: none;
  font-weight: 600;

  &:hover {
    color: var(--color-text);
    text-decoration: underline;
  }

  &--busy {
    opacity: 0.6;
    pointer-events: none;
  }
}
</style>
