<script setup lang="ts">
import { inject } from 'vue';
import type { ParsedReplyPage } from '@/parsers/reply';
import CommentBody from '@/content/comments/CommentBody.vue';
import CommentForm from '@/content/comments/CommentForm.vue';

const pageData = inject<ParsedReplyPage>('pageData')!;
</script>

<template>
  <div class="reply-page">
    <template v-if="pageData.isLoggedOut">
      <div class="reply-page__message">
         You have to <a href="login?goto=reply">log in</a> to reply.
      </div>
    </template>
    <template v-else-if="pageData.parent && pageData.replyForm">
      <div class="reply-page__parent">
        <div class="reply-page__parent-header">
          <a :href="`user?id=${pageData.parent.author}`" class="reply-page__parent-author">{{ pageData.parent.author }}</a>
          <span class="reply-page__parent-age">{{ pageData.parent.age }}</span>
        </div>
        
        <div class="reply-page__parent-body">
          <CommentBody :html="pageData.parent.bodyHtml" :gray-level="null" />
        </div>
      </div>
      
      <div class="reply-page__form">
         <CommentForm :form="{ ...pageData.replyForm, submitLabel: 'reply' }" :autofocus="true" />
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.reply-page {
  padding: 1rem 0;
  max-width: 800px;
  
  &__message {
    padding: 1rem 0;
    
    a {
      color: var(--color-text);
      text-decoration: underline;
      &:hover { color: var(--color-accent); }
    }
  }
  
  &__parent {
    margin-bottom: 2rem;
  }
  
  &__parent-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
  }
  
  &__parent-author {
    color: var(--color-text);
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  &__parent-age {
    color: var(--color-text-muted);
  }
  
  &__parent-body {
    margin-top: 0.5rem;
  }

  &__form {
    margin-top: 1.5rem;
  }
}
</style>
