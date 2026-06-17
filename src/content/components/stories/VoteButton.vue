<script setup lang="ts">
import type { VoteActionTarget } from '@/content/composables/use-hn-actions';
import type { VoteState } from '@/parsers/shared/actions';
import { Triangle } from 'lucide-vue-next';
import { computed, ref, watch } from 'vue';
import { canSubmitAuthActionInBackground, useCurrentUser } from '@/content/composables/current-user';
import { useHnActions } from '@/content/composables/use-hn-actions';
import { getVoteActionHref } from '@/parsers/shared/actions';

const props = defineProps<{
  voteState?: VoteState;
  itemId?: string;
  voteTarget?: VoteActionTarget | null;
}>();

const { isBusy, submitVote } = useHnActions();
const currentUser = useCurrentUser();
const canSubmitInBackground = canSubmitAuthActionInBackground(currentUser);

const currentVoteState = ref<VoteState>(props.voteState ?? props.voteTarget?.voteState ?? { kind: 'unavailable' });
const currentHref = computed(() => getVoteActionHref(currentVoteState.value, currentVoteState.value.kind === 'active' ? 'un' : 'up'));
const isActive = computed(() => currentVoteState.value.kind === 'active' || currentVoteState.value.kind === 'disabled-active');
const isDisabled = computed(() => currentVoteState.value.kind === 'disabled-active');
const currentLabel = computed(() => {
  if (currentVoteState.value.kind === 'active') {
    return currentVoteState.value.direction === 'down' ? 'undown' : 'unvote';
  }

  if (currentVoteState.value.kind === 'disabled-active') {
    if (currentVoteState.value.direction === 'up') {
      return 'upvoted';
    }

    if (currentVoteState.value.direction === 'down') {
      return 'downvoted';
    }

    return 'voted';
  }

  return 'upvote';
});
const currentDirection = computed(() => currentVoteState.value.kind === 'active' ? 'un' : 'up');

watch(
  () => props.voteState,
  (voteState) => {
    if (voteState) {
      currentVoteState.value = voteState;
    }
  },
);

watch(
  () => props.voteTarget?.voteState,
  (voteState) => {
    if (voteState) {
      currentVoteState.value = voteState;
    }
  },
);

async function handleClick(event: MouseEvent) {
  if (!props.voteTarget || !currentHref.value || !canSubmitInBackground) {
    return;
  }

  event.preventDefault();
  const succeeded = await submitVote(props.voteTarget, currentDirection.value);
  if (succeeded) {
    currentVoteState.value = props.voteTarget.voteState;
  }
}
</script>

<template>
  <span class="vote-btn-slot">
    <a
      v-if="currentHref"
      :href="currentHref"
      class="vote-btn"
      :class="{ 'vote-btn--active': isActive, 'vote-btn--busy': isBusy }"
      :title="currentLabel"
      :aria-label="currentLabel"
      :aria-disabled="isBusy ? 'true' : undefined"
      @click="handleClick"
    >
      <Triangle :size="13" fill="currentColor" :stroke-width="0" />
    </a>
    <span
      v-else-if="isDisabled"
      class="vote-btn vote-btn--active vote-btn--disabled"
      :title="currentLabel"
      :aria-label="currentLabel"
      aria-disabled="true"
    >
      <Triangle :size="13" fill="currentColor" :stroke-width="0" />
    </span>
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

  &--disabled {
    cursor: default;
    pointer-events: none;
  }

  &--hidden {
    display: none;
  }
}
</style>
