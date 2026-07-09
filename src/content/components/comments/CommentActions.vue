<script setup lang="ts">
import type { FlagActionTarget, VoteActionTarget, VoteSubmitDirection } from '@/content/composables/use-hn-actions';
import { Triangle } from 'lucide-vue-next';
import { computed } from 'vue';
import FlagButton from '@/content/components/comments/FlagButton.vue';
import MetaSep from '@/content/components/ui/MetaSep.vue';
import { canSubmitAuthActionInBackground, useCurrentUser } from '@/content/composables/current-user';
import { useHnActions } from '@/content/composables/use-hn-actions';
import { getToggleActionHref } from '@/parsers/shared/actions';

const props = defineProps<{
  voteTarget?: VoteActionTarget | null;
  replyLink?: string | null;
  editUrl?: string | null;
  deleteUrl?: string | null;
  flagTarget?: FlagActionTarget | null;
}>();

const { isBusy, submitVote } = useHnActions();
const currentUser = useCurrentUser();
const canSubmitVotesInBackground = canSubmitAuthActionInBackground(currentUser);
const voteState = computed(() => props.voteTarget?.voteState);
const upHref = computed(() => voteState.value?.kind === 'available' ? voteState.value.upHref : null);
const downHref = computed(() => voteState.value?.kind === 'available' ? voteState.value.downHref : null);
const unvoteHref = computed(() => voteState.value?.kind === 'active' ? voteState.value.unvoteHref : null);
const activeVoteLabel = computed(() => voteState.value?.kind === 'active' && voteState.value.direction === 'down'
  ? 'undown'
  : 'unvote');
const disabledVoteLabel = computed(() => {
  if (voteState.value?.kind !== 'disabled-active') {
    return 'voted';
  }

  if (voteState.value.direction === 'up') {
    return 'upvoted';
  }

  if (voteState.value.direction === 'down') {
    return 'downvoted';
  }

  return 'voted';
});
const isDisabledVote = computed(() => voteState.value?.kind === 'disabled-active');
const isDisabledDownvote = computed(() => voteState.value?.kind === 'disabled-active' && voteState.value.direction === 'down');
const hasVoteActions = computed(() => {
  if (voteState.value?.kind === 'available') {
    return !!(voteState.value.upHref || voteState.value.downHref);
  }

  return voteState.value?.kind === 'active' || voteState.value?.kind === 'disabled-active';
});
const hasReplyAction = computed(() => !!props.replyLink);
const hasEditAction = computed(() => !!props.editUrl);
const hasDeleteAction = computed(() => !!props.deleteUrl);
const flagHref = computed(() => props.flagTarget ? getToggleActionHref(props.flagTarget.flagAction) : null);

async function handleVoteClick(event: MouseEvent, direction: VoteSubmitDirection) {
  if (!props.voteTarget || !canSubmitVotesInBackground) {
    return;
  }

  event.preventDefault();
  await submitVote(props.voteTarget, direction);
}
</script>

<template>
  <div class="comment-actions">
    <div v-if="hasVoteActions" class="comment-actions__votes">
      <a
        v-if="upHref"
        :href="upHref"
        class="comment-actions__vote comment-actions__vote--up"
        :class="{ 'comment-actions__vote--busy': isBusy }"
        title="upvote"
        :aria-disabled="isBusy ? 'true' : undefined"
        @click="handleVoteClick($event, 'up')"
      >
        <Triangle :size="10" fill="currentColor" :stroke-width="0" />
        <span>upvote</span>
      </a>
      <a
        v-if="unvoteHref"
        :href="unvoteHref"
        class="comment-actions__vote comment-actions__vote--active"
        :class="{
          'comment-actions__vote--down': activeVoteLabel === 'undown',
          'comment-actions__vote--up': activeVoteLabel !== 'undown',
          'comment-actions__vote--busy': isBusy,
        }"
        :title="activeVoteLabel"
        :aria-disabled="isBusy ? 'true' : undefined"
        @click="handleVoteClick($event, 'un')"
      >
        <Triangle :size="10" fill="currentColor" :stroke-width="0" />
        <span>{{ activeVoteLabel }}</span>
      </a>
      <a
        v-if="downHref"
        :href="downHref"
        class="comment-actions__vote comment-actions__vote--down"
        :class="{ 'comment-actions__vote--busy': isBusy }"
        title="downvote"
        :aria-disabled="isBusy ? 'true' : undefined"
        @click="handleVoteClick($event, 'down')"
      >
        <Triangle :size="10" fill="currentColor" :stroke-width="0" />
        <span>downvote</span>
      </a>
      <span
        v-if="isDisabledVote"
        class="comment-actions__vote comment-actions__vote--active comment-actions__vote--disabled"
        :class="{
          'comment-actions__vote--down': isDisabledDownvote,
          'comment-actions__vote--up': !isDisabledDownvote,
        }"
        :title="disabledVoteLabel"
        aria-disabled="true"
      >
        <Triangle :size="10" fill="currentColor" :stroke-width="0" />
        <span>{{ disabledVoteLabel }}</span>
      </span>
    </div>

    <template v-if="replyLink">
      <MetaSep v-if="hasVoteActions" />
      <a :href="replyLink" class="comment-actions__link">reply</a>
    </template>
    <template v-if="editUrl">
      <MetaSep v-if="hasVoteActions || hasReplyAction" />
      <a :href="editUrl" class="comment-actions__link">edit</a>
    </template>
    <template v-if="deleteUrl">
      <MetaSep v-if="hasVoteActions || hasReplyAction || hasEditAction" />
      <a :href="deleteUrl" class="comment-actions__link comment-actions__link--delete">delete</a>
    </template>
    <template v-if="flagHref">
      <MetaSep v-if="hasVoteActions || hasReplyAction || hasEditAction || hasDeleteAction" />
      <FlagButton :href="flagHref" :flag-target="flagTarget" />
    </template>
  </div>
</template>

<style scoped lang="scss">
.comment-actions {
  margin-top: 0.2rem;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.6rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-text-muted);

  &__votes {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.7rem;
    margin-right: 0.1rem;
  }

  &__vote {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    color: var(--color-text-muted);
    transition: color 0.15s ease;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: lowercase;
    position: relative;
    text-decoration: none;

    &::before {
      content: "";
      position: absolute;
      inset: -5px;
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

    &--up {
      color: var(--color-text-muted);
    }

    &--active {
      color: var(--color-accent);
    }

    &--hidden {
      display: none;
    }

    &--down {
      .lucide {
        transform: rotate(180deg);
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
  }

  &__unvote-slot {
    display: inline-flex;
    align-items: center;
  }

  &__link {
    position: relative;
    color: inherit;
    text-decoration: none;

    &::before {
      content: "";
      position: absolute;
      inset: -5px -4px;
    }

    &:hover {
      color: var(--color-text);
      text-decoration: underline;
    }

    &--delete:hover {
      color: #ff3e00;
    }
  }

  :deep(.flag-button) {
    position: relative;

    &::before {
      content: "";
      position: absolute;
      inset: -5px -4px;
    }
  }

  @media (max-width: 640px) {
    gap: 0.9rem;
    font-size: 0.98rem;

    &__votes {
      gap: 1rem;
    }

    &__vote {
      gap: 0.4rem;
      font-size: 0.96rem;

      &::before {
        inset: -10px -9px;
      }

      .lucide {
        width: 14px;
        height: 14px;
      }
    }

    &__link {
      font-size: 0.96rem;

      &::before {
        inset: -10px -8px;
      }
    }

    :deep(.flag-button)::before {
      inset: -10px -8px;
    }
  }
}
</style>
