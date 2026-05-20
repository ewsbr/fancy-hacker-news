<script setup lang="ts">
import type { FavoriteActionTarget } from '@/content/composables/use-hn-actions';
import { computed } from 'vue';
import { useHnActions } from '@/content/composables/use-hn-actions';

const props = defineProps<{
  href: string;
  action: 'favorite' | 'hide';
  favoriteTarget?: FavoriteActionTarget | null;
  activeLabel?: string;
  inactiveLabel?: string;
}>();

const emit = defineEmits<{
  success: [];
}>();

const { isBusy, submitFavorite, submitHide } = useHnActions();

const isActive = computed(() => (props.favoriteTarget?.favoriteUrl ?? props.href).includes('un=t'));

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

  const succeeded = props.action === 'favorite'
    ? await submitFavorite(props.favoriteTarget ?? { favoriteUrl: props.href })
    : await submitHide(props.href);

  if (succeeded) {
    emit('success');
  }
}
</script>

<template>
  <a
    :href="href"
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
