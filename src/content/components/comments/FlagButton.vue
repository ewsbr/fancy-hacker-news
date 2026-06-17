<script setup lang="ts">
import type { FlagActionTarget } from '@/content/composables/use-hn-actions';
import { computed } from 'vue';
import { useHnActions } from '@/content/composables/use-hn-actions';
import { getToggleActionHref } from '@/parsers/shared/actions';

const props = defineProps<{
  href?: string | null;
  /** Whether this is an unflag action (detected from URL containing un=t) */
  isUnflag?: boolean;
  flagTarget?: FlagActionTarget | null;
}>();

const { isBusy, submitFlag } = useHnActions();

const actionHref = computed(() => props.flagTarget
  ? getToggleActionHref(props.flagTarget.flagAction)
  : (props.href ?? null));

const isUnflagAction = computed(
  () => props.flagTarget?.flagAction.kind === 'active'
    || props.flagTarget?.isFlagged === true
    || props.isUnflag === true
    || props.href?.includes('un=t') === true,
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
    v-if="actionHref"
    :href="actionHref"
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
