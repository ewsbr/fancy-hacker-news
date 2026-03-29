<script setup lang="ts">
import type { FlatComment as FlatCommentType } from '@/parsers/newComments';
import CommentBody from './CommentBody.vue';
import { Triangle } from 'lucide-vue-next';

defineProps<{
  comment: FlatCommentType;
}>();
</script>

<template>
  <div class="flat-comment" :id="comment.id">
    <div class="flat-comment__header">
      <a 
        :href="`user?id=${comment.author}`" 
        class="flat-comment__author"
        :class="{ 'flat-comment__author--new': comment.authorIsNew }"
      >
        {{ comment.author }}
      </a>
      
      <span class="flat-comment__age">
        <a :href="comment.ageLink">{{ comment.age }}</a>
      </span>
      
      <span class="flat-comment__separator" aria-hidden="true">&middot;</span>
      
      <span class="flat-comment__on-story">
        on: <a :href="comment.onStory.link" class="flat-comment__story-title">{{ comment.onStory.title }}</a>
      </span>
    </div>
    
    <div class="flat-comment__body">
      <CommentBody :html="comment.bodyHtml" :gray-level="null" />
    </div>
    
    <div class="flat-comment__actions">
      <div class="flat-comment__votes">
        <a 
          v-if="comment.voteUp || comment.voteUn" 
          :href="comment.voteUn || comment.voteUp || ''" 
          class="flat-comment__vote-action"
          :class="{ 
            'flat-comment__vote-action--up': true, 
            'flat-comment__vote-action--active': comment.voteUn 
          }"
          :title="comment.voteUn ? 'unvote' : 'upvote'"
        >
          <Triangle :size="10" fill="currentColor" :stroke-width="0" />
          <span>{{ comment.voteUn ? 'unvote' : 'upvote' }}</span>
        </a>
        <a 
          v-if="comment.voteDown" 
          :href="comment.voteDown" 
          class="flat-comment__vote-action flat-comment__vote-action--down"
          title="downvote"
        >
          <Triangle :size="10" fill="currentColor" :stroke-width="0" />
          <span>downvote</span>
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.flat-comment {
  padding: 0.75rem 0;
  
  &__header {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    font-size: 0.85rem;
    margin-bottom: 0.25rem;
  }
  
  &__author {
    color: var(--color-text);
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
    
    &--new {
      color: var(--color-new-user);
    }
  }
  
  &__age {
    color: var(--color-text-muted);
    
    a {
      color: inherit;
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
  
  &__separator {
    color: var(--color-text-muted);
    font-weight: 900;
    opacity: 0.6;
    user-select: none;
  }
  
  &__on-story {
    color: var(--color-text-muted);
  }
  
  &__story-title {
    color: var(--color-text);
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  &__body {
    margin-left: 0;
  }
  
  &__actions {
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-muted);
  }

  &__votes {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    margin-right: 0.1rem;
  }

  &__vote-action {
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
      color: color-mix(in srgb, var(--color-accent) 70%, var(--color-text-muted));
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
}
</style>
