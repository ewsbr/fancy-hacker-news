<script setup lang="ts">
import type { FlatComment as FlatCommentType } from '@/parsers/newComments';
import CommentBody from './CommentBody.vue';
import CommentActions from '@/content/shared/CommentActions.vue';
import MetaSep from '@/content/shared/MetaSep.vue';
import OnStoryHeader from '@/content/shared/OnStoryHeader.vue';
import AuthorByline from '@/content/shared/AuthorByline.vue';

defineProps<{
  comment: FlatCommentType;
}>();
</script>

<template>
  <div class="flat-comment" :id="comment.id">
    <div class="flat-comment__header">
      <AuthorByline
        :author="comment.author"
        :author-is-new="comment.authorIsNew"
        :age-link="comment.ageLink"
        :age="comment.age"
      />
      
      <MetaSep />
      
      <OnStoryHeader label="on" :href="comment.onStory.link" :title="comment.onStory.title" />
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
  
  &__body {
    margin-left: 0;
  }
}
</style>
