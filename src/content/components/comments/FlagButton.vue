<script setup lang="ts">
import type { FlagActionTarget } from '@/content/composables/use-hn-actions';
import { computed } from 'vue';
import { useHnActions } from '@/content/composables/use-hn-actions';
import { getToggleActionHref } from '@/parsers/shared/actions';

const props = defineProps<{
  flagTarget: FlagActionTarget;
}>();

const { isBusy, submitFlag } = useHnActions();
const actionHref = computed(() => getToggleActionHref(props.flagTarget.flagAction));
const isUnflagAction = computed(() => props.flagTarget.flagAction.kind === 'active' || props.flagTarget.isFlagged);

function handleClick(event: MouseEvent) {
  event.preventDefault();
  if (window.confirm(`Are you sure you want to ${isUnflagAction.value ? 'unflag' : 'flag'} this?`)) {
    void submitFlag(props.flagTarget);
  }
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
