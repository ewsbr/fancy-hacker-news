<script setup lang="ts">
import { computed } from 'vue';
import { Triangle } from 'lucide-vue-next';
import FlagButton from '@/content/shared/FlagButton.vue';
import MetaSep from '@/content/shared/MetaSep.vue';

const props = defineProps<{
  voteUp?: string | null;
  voteUn?: string | null;
  voteDown?: string | null;
  replyLink?: string | null;
  editUrl?: string | null;
  deleteUrl?: string | null;
  flagUrl?: string | null;
}>();

const hasVoteActions = computed(() => !!(props.voteUp || props.voteUn || props.voteDown));
const hasReplyAction = computed(() => !!props.replyLink);
const hasEditAction = computed(() => !!props.editUrl);
const hasDeleteAction = computed(() => !!props.deleteUrl);
</script>

<template>
  <div class="comment-actions">
    <div v-if="hasVoteActions" class="comment-actions__votes">
      <a
        v-if="voteUp || voteUn"
        :href="voteUn || voteUp || undefined"
        class="comment-actions__vote comment-actions__vote--up"
        :class="{ 'comment-actions__vote--active': !!voteUn }"
        :title="voteUn ? 'unvote' : 'upvote'"
      >
        <Triangle :size="10" fill="currentColor" :stroke-width="0" />
        <span>{{ voteUn ? 'unvote' : 'upvote' }}</span>
      </a>
      <a
        v-if="voteDown"
        :href="voteDown"
        class="comment-actions__vote comment-actions__vote--down"
        title="downvote"
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
      <FlagButton :href="flagUrl" />
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

    &--down {
      .lucide {
        transform: rotate(180deg);
      }
    }
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
}
</style>
