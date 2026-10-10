<script setup lang="ts">
import type { FavoriteActionTarget, HideActionTarget } from '@/content/composables/use-hn-actions';
import { computed } from 'vue';
import { useHnActions } from '@/content/composables/use-hn-actions';
import { getToggleActionHref } from '@/parsers/shared/actions';

const props = defineProps<{
  action: 'favorite' | 'hide';
  favoriteTarget?: FavoriteActionTarget;
  hideTarget?: HideActionTarget;
}>();

const { isBusy, submitFavorite, submitHide } = useHnActions();
const actionState = computed(() => props.action === 'favorite' ? props.favoriteTarget!.favoriteAction : props.hideTarget!.hideAction);
const actionHref = computed(() => getToggleActionHref(actionState.value));
const label = computed(() => {
  const isActive = actionState.value.kind === 'active';
  return props.action === 'hide' ? (isActive ? 'unhide' : 'hide') : (isActive ? 'un-favorite' : 'favorite');
});

function handleClick(event: MouseEvent) {
  event.preventDefault();
  void (props.action === 'favorite' ? submitFavorite(props.favoriteTarget!) : submitHide(props.hideTarget!));
}
</script>

<template>
  <a
    v-if="actionHref"
    :href="actionHref"
    class="inline-action-link"
    :class="{ 'inline-action-link--busy': isBusy }"
    :aria-disabled="isBusy ? 'true' : undefined"
    @click="handleClick"
  >
    {{ label }}
  </a>
</template>

<style scoped lang="scss">
.inline-action-link {
  color: inherit;
  text-decoration: none;

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
