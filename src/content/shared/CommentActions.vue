<script setup lang="ts">
import { Triangle } from 'lucide-vue-next';
import FlagButton from '@/content/shared/FlagButton.vue';
import MetaSep from '@/content/shared/MetaSep.vue';

defineProps<{
  voteUp?: string | null;
  voteUn?: string | null;
  voteDown?: string | null;
  replyLink?: string | null;
  editUrl?: string | null;
  deleteUrl?: string | null;
  flagUrl?: string | null;
}>();
</script>

<template>
  <div class="comment-actions">
    <div v-if="voteUp || voteUn || voteDown" class="comment-actions__votes">
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
      <MetaSep />
      <a :href="replyLink" class="comment-actions__link">reply</a>
    </template>
    <template v-if="editUrl">
      <MetaSep />
      <a :href="editUrl" class="comment-actions__link">edit</a>
    </template>
    <template v-if="deleteUrl">
      <MetaSep />
      <a :href="deleteUrl" class="comment-actions__link comment-actions__link--delete">delete</a>
    </template>
    <template v-if="flagUrl">
      <MetaSep />
      <FlagButton :href="flagUrl" />
    </template>
  </div>
</template>

<style scoped lang="scss">
.comment-actions {
  margin-top: 0.2rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-muted);

  &__votes {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    margin-right: 0.1rem;
  }

  &__vote {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: var(--color-text-muted);
    transition: color 0.15s ease;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: lowercase;
    position: relative;

    &::before {
      content: "";
      position: absolute;
      top: -5px;
      left: -5px;
      right: -5px;
      bottom: -5px;
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
    color: inherit;
    text-decoration: none;

    &:hover {
      color: var(--color-text);
      text-decoration: underline;
    }

    &--delete:hover {
      color: #ff3e00;
    }
  }
}
</style>
