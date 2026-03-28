<script setup lang="ts">
import { inject } from 'vue';
import type { ParsedItemPage } from '@/parsers/item';
import StoryDetail from '@/content/stories/StoryDetail.vue';
import CommentTree from '@/content/comments/CommentTree.vue';
import CommentForm from '@/content/comments/CommentForm.vue';
import CommentHeader from '@/content/comments/CommentHeader.vue';
import CommentBody from '@/content/comments/CommentBody.vue';

const pageData = inject<ParsedItemPage>('pageData');
</script>

<template>
  <div class="comments-page" v-if="pageData">
    <div class="comments-page__container">
      <template v-if="pageData.item.type === 'story'">
        <StoryDetail :item="pageData.item" />
      </template>
      
      <template v-else-if="pageData.item.type === 'comment'">
        <div class="comments-page__comment-parent">
          <div class="comments-page__context" v-if="pageData.item.storyTitle">
            on: <a :href="pageData.item.storyLink || ''" class="comments-page__context-link">{{ pageData.item.storyTitle }}</a>
          </div>
          
          <CommentHeader 
            :node="{
               ...pageData.item, 
               isCollapsed: false, 
               collapsedCount: 0,
               isDead: false,
               isFlagged: false,
               navLinks: {
                 parent: pageData.item.parentLink,
                 context: pageData.item.contextLink
               }
            } as any" 
            @toggle="() => {}" 
          />
          <div class="comments-page__comment-body">
            <CommentBody :html="pageData.item.bodyHtml || ''" gray-level="c00" />
          </div>
          
          <div class="comments-page__actions">
            <span v-if="pageData.item.favoriteUrl" class="comments-page__sep">&middot;</span>
            <a v-if="pageData.item.favoriteUrl" :href="pageData.item.favoriteUrl" class="comments-page__action-link">favorite</a>
          </div>
        </div>
      </template>

      <div v-if="pageData.replyForm" class="comments-page__form-wrapper">
        <CommentForm :form="pageData.replyForm" />
      </div>

      <!-- Tree -->
      <CommentTree :comments="pageData.comments" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.comments-page {
  padding-bottom: 2rem;

  &__container {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-top: 3px solid var(--color-accent);
    border-radius: 4px;
    box-shadow: var(--shadow-elevation);
    overflow: hidden;
  }

  &__comment-parent {
    padding: 0.75rem 0.75rem 1rem;
    background: color-mix(in srgb, var(--color-surface) 98%, var(--color-accent) 2%);
    border-bottom: 1px solid var(--color-border);
  }

  &__context {
    margin-bottom: 0.5rem;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--color-text-muted);
  }

  &__context-link {
    color: var(--color-text);
    font-family: var(--font-title);
    text-decoration: none;

    &:hover {
      color: var(--color-accent);
    }
  }

  &__comment-body {
    margin-top: 0.75rem;
    font-size: 0.95rem;
    line-height: 1.55;
    color: var(--color-text);
  }

  &__actions {
    margin-top: 0.75rem;
    display: flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--color-text-muted);
  }

  &__sep {
    color: var(--color-border);
    font-weight: 900;
    font-size: 1.1rem;
    user-select: none;
  }

  &__action-link {
    color: inherit;
    text-decoration: none;

    &:hover {
      color: var(--color-text);
      text-decoration: underline;
    }
  }

  &__form-wrapper {
    padding: 0.875rem 0.75rem;
  }
}

// Deep selector for the comment tree within the container
:deep(.comment-tree) {
  margin-top: 0;
  padding: 0.75rem;
  background: var(--color-surface);
}
</style>
