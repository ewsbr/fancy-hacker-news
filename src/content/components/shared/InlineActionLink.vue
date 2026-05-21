<script setup lang="ts">
import type { FavoriteActionTarget, HideActionTarget } from '@/content/composables/use-hn-actions';
import { computed } from 'vue';
import { useHnActions } from '@/content/composables/use-hn-actions';

const props = defineProps<{
  href: string;
  action: 'favorite' | 'hide';
  favoriteTarget?: FavoriteActionTarget | null;
  hideTarget?: HideActionTarget | null;
  activeLabel?: string;
  inactiveLabel?: string;
}>();

const { isBusy, submitFavorite, submitHide } = useHnActions();

const actionHref = computed(() => {
  if (props.action === 'favorite') {
    return props.favoriteTarget?.favoriteUrl ?? props.href;
  }

  return props.hideTarget?.hideUrl ?? props.href;
});

const isActive = computed(() => actionHref.value.includes('un=t'));

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
  event.preventDefault();

  await (props.action === 'favorite'
    ? submitFavorite(props.favoriteTarget ?? { favoriteUrl: props.href })
    : submitHide(props.hideTarget ?? { hideUrl: props.href }));
}
</script>

<template>
  <a
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
