<script setup lang="ts">
import type { FlatComment as FlatCommentType } from '@/parsers/newComments';
import CommentBody from './CommentBody.vue';
import CommentActions from '@/content/shared/CommentActions.vue';

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
    
    <CommentActions
      :vote-up="comment.voteUp"
      :vote-un="comment.voteUn"
      :vote-down="comment.voteDown"
    />
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
}
</style>
