<script setup lang="ts">
import type { FavoriteActionTarget, HideActionTarget } from '@/content/composables/use-hn-actions';
import { computed } from 'vue';
import { useHnActions } from '@/content/composables/use-hn-actions';
import { getToggleActionHref } from '@/parsers/shared/actions';

const props = defineProps<{
  href?: string | null;
  action: 'favorite' | 'hide';
  favoriteTarget?: FavoriteActionTarget | null;
  hideTarget?: HideActionTarget | null;
  activeLabel?: string;
  inactiveLabel?: string;
}>();

const { isBusy, submitFavorite, submitHide } = useHnActions();

const actionState = computed(() => {
  if (props.action === 'favorite') {
    return props.favoriteTarget?.favoriteAction ?? null;
  }

  return props.hideTarget?.hideAction ?? null;
});

const actionHref = computed(() => {
  return actionState.value ? getToggleActionHref(actionState.value) : (props.href ?? null);
});

const isActive = computed(() => actionState.value?.kind === 'active' || actionHref.value?.includes('un=t') === true);

const label = computed(() => {
  if (props.action === 'hide') {
    return isActive.value ? (props.activeLabel ?? 'unhide') : (props.inactiveLabel ?? 'hide');
  }

  if (isActive.value) {
    return props.activeLabel ?? 'un-favorite';
  }

  return props.inactiveLabel ?? 'favorite';
});

async function handleClick(event: MouseEvent) {
  const hasTarget = props.action === 'favorite' ? props.favoriteTarget != null : props.hideTarget != null;
  if (!hasTarget) {
    return;
  }

  event.preventDefault();
  await (props.action === 'favorite'
    ? submitFavorite(props.favoriteTarget!)
    : submitHide(props.hideTarget!));
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
