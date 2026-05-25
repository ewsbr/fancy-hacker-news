<script setup lang="ts">
import type { VoteActionTarget } from '@/content/composables/use-hn-actions';
import { Triangle } from 'lucide-vue-next';
import { computed, ref, watch } from 'vue';
import { useHnActions } from '@/content/composables/use-hn-actions';

const props = defineProps<{
  href: string | null;
  voteUnHref?: string | null;
  itemId?: string;
  voteTarget?: VoteActionTarget | null;
}>();

const { isBusy, submitVote } = useHnActions();

const currentVoteUnHref = ref(props.voteUnHref ?? null);
const currentHref = computed(() => currentVoteUnHref.value || props.href || null);
const currentDirection = computed(() => (currentVoteUnHref.value ? 'un' : 'up'));

watch(
  () => props.voteUnHref,
  (voteUnHref) => {
    currentVoteUnHref.value = voteUnHref ?? null;
  },
);

async function handleClick(event: MouseEvent) {
  if (!props.voteTarget || !currentHref.value) {
    return;
  }

  event.preventDefault();
  const succeeded = await submitVote(props.voteTarget, currentHref.value, currentDirection.value);
  if (succeeded) {
    currentVoteUnHref.value = props.voteTarget.voteUn;
  }
}
</script>

<template>
  <span class="vote-btn-slot">
    <a
      v-if="currentHref"
      :href="currentHref"
      class="vote-btn"
      :class="{ 'vote-btn--active': !!currentVoteUnHref, 'vote-btn--busy': isBusy }"
      :title="currentVoteUnHref ? 'unvote' : 'upvote'"
      :aria-label="currentVoteUnHref ? 'unvote' : 'upvote'"
      :aria-disabled="isBusy ? 'true' : undefined"
      @click="handleClick"
    >
      <Triangle :size="13" fill="currentColor" :stroke-width="0" />
    </a>
    <span v-else class="vote-btn vote-btn--inactive" aria-hidden="true">
      <Triangle :size="13" fill="currentColor" :stroke-width="0" />
    </span>
  </span>
</template>

<style scoped lang="scss">
.vote-btn-slot {
  display: inline-flex;
  align-items: flex-start;
  justify-content: center;
}

.vote-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  transition: color 0.1s ease;

  &::before {
    content: "";
    position: absolute;
    top: -6px;
    left: -6px;
    right: -6px;
    bottom: -6px;

    @media (max-width: 640px) {
      top: -12px;
      left: -12px;
      right: -12px;
      bottom: -12px;
    }
  }

  &:visited,
  &:active,
  &:focus {
    color: var(--color-text-muted);
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      color: var(--color-accent);
      text-decoration: none;
    }
  }

  &--inactive {
    opacity: 0.2;
    pointer-events: none;
  }

  &--active {
    color: var(--color-accent);

    &:visited,
    &:active,
    &:focus {
      color: var(--color-accent);
    }
  }

  &--busy {
    opacity: 0.6;
    pointer-events: none;
  }

  &--hidden {
    display: none;
  }
}
</style>
