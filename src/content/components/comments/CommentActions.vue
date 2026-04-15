<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Triangle } from 'lucide-vue-next';
import FlagButton from '@/content/components/comments/FlagButton.vue';
import MetaSep from '@/content/components/ui/MetaSep.vue';
import type { FlagActionTarget, VoteActionTarget } from '@/content/composables/use-hn-actions';
import { useHnActions } from '@/content/composables/use-hn-actions';

const props = defineProps<{
  itemId?: string;
  voteUp?: string | null;
  voteUn?: string | null;
  voteDown?: string | null;
  voteTarget?: VoteActionTarget | null;
  replyLink?: string | null;
  editUrl?: string | null;
  deleteUrl?: string | null;
  flagUrl?: string | null;
  flagTarget?: FlagActionTarget | null;
}>();

const { isBusy, submitVote } = useHnActions();
const currentVoteUn = ref(props.voteUn ?? null);
const hasVoteActions = computed(() => !!(props.voteUp || currentVoteUn.value || props.voteDown));
const hasReplyAction = computed(() => !!props.replyLink);
const hasEditAction = computed(() => !!props.editUrl);
const hasDeleteAction = computed(() => !!props.deleteUrl);

watch(
  () => props.voteUn,
  voteUn => {
    currentVoteUn.value = voteUn ?? null;
  },
);

async function handleVoteClick(event: MouseEvent, href: string | null | undefined, direction: 'up' | 'down' | 'un') {
  if (!props.voteTarget || !href) {
    return;
  }

  event.preventDefault();
  const succeeded = await submitVote(props.voteTarget, href, direction);
  if (succeeded) {
    currentVoteUn.value = props.voteTarget.voteUn;
  }
}
</script>

<template>
  <div class="comment-actions">
    <div v-if="hasVoteActions" class="comment-actions__votes">
      <a
        v-if="voteUp && !currentVoteUn"
        :href="voteUp"
        class="comment-actions__vote comment-actions__vote--up"
        :class="{ 'comment-actions__vote--busy': isBusy }"
        title="upvote"
        :aria-disabled="isBusy ? 'true' : undefined"
        @click="handleVoteClick($event, voteUp, 'up')"
      >
        <Triangle :size="10" fill="currentColor" :stroke-width="0" />
        <span>upvote</span>
      </a>
      <a
        v-if="currentVoteUn"
        :href="currentVoteUn"
        class="comment-actions__vote comment-actions__vote--up comment-actions__vote--active"
        :class="{ 'comment-actions__vote--busy': isBusy }"
        title="unvote"
        :aria-disabled="isBusy ? 'true' : undefined"
        @click="handleVoteClick($event, currentVoteUn, 'un')"
      >
        <Triangle :size="10" fill="currentColor" :stroke-width="0" />
        <span>unvote</span>
      </a>
      <a
        v-if="voteDown"
        :href="voteDown"
        class="comment-actions__vote comment-actions__vote--down"
        :class="{ 'comment-actions__vote--busy': isBusy }"
        title="downvote"
        :aria-disabled="isBusy ? 'true' : undefined"
        @click="handleVoteClick($event, voteDown, 'down')"
      >
        <Triangle :size="10" fill="currentColor" :stroke-width="0" />
        <span>downvote</span>
      </a>
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
    <template v-if="flagUrl">
      <MetaSep v-if="hasVoteActions || hasReplyAction || hasEditAction || hasDeleteAction" />
      <FlagButton :href="flagUrl" :flag-target="flagTarget" />
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

    &:hover {
      color: var(--color-accent);
      text-decoration: none;
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
