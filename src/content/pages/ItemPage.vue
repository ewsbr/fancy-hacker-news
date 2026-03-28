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
  <div class="item-page" v-if="pageData">
    <template v-if="pageData.item.type === 'story'">
      <StoryDetail :item="pageData.item" />
    </template>
    
    <template v-else-if="pageData.item.type === 'comment'">
      <div class="item-page__comment-parent">
        <div class="item-page__context" v-if="pageData.item.storyTitle">
          on: <a :href="pageData.item.storyLink || ''" class="item-page__context-link">{{ pageData.item.storyTitle }}</a>
        </div>
        
        <!-- Simulate a CommentNode visually for the root comment being viewed -->
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
        <div class="item-page__comment-body">
          <CommentBody :html="pageData.item.bodyHtml || ''" gray-level="c00" />
        </div>
        
        <div class="item-page__actions">
          <a v-if="pageData.item.favoriteUrl" :href="pageData.item.favoriteUrl" class="item-page__action-link">favorite</a>
        </div>
      </div>
    </template>

    <div v-if="pageData.replyForm" class="item-page__form-wrapper">
      <CommentForm :form="pageData.replyForm" />
    </div>

    <!-- Tree -->
    <CommentTree :comments="pageData.comments" />
  </div>
</template>

<style scoped lang="scss">
.item-page {
  
  &__comment-parent {
    margin-bottom: 1.5rem;
    border-radius: 4px;
    background: var(--color-surface);
    padding: 1rem;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    border: 1px solid var(--color-border);
  }

  &__context {
    margin-bottom: 0.5rem;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--color-muted);
  }

  &__context-link {
    color: inherit;
    text-decoration: none;

    &:hover {
      color: var(--color-accent);
      text-decoration: underline;
    }
  }

  &__comment-body {
    margin-top: 0.75rem;
  }

  &__actions {
    margin-top: 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-muted);
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
    margin-bottom: 1rem;
  }
}
</style>
