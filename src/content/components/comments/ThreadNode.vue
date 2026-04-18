<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ThreadEntry } from '@/parsers/threads';
import CommentHeader from './CommentHeader.vue';
import CommentBody from './CommentBody.vue';
import CommentActions from '@/content/components/comments/CommentActions.vue';
import OnStoryHeader from './OnStoryHeader.vue';
import { getOriginalPosterTitle } from '@/content/utils/comment-badges';

const props = defineProps<{
  node: ThreadEntry;
  threadAuthor?: string | null;
  parentAuthor?: string | null;
}>();

const HEAVY_DOWNVOTE = new Set(['cce', 'cdd']);
const isHeavilyDownvoted = props.node.grayLevel !== null && HEAVY_DOWNVOTE.has(props.node.grayLevel.toLowerCase());
const isCollapsed = ref(props.node.isCollapsed || isHeavilyDownvoted);
const threadAuthor = computed(() => props.threadAuthor ?? props.node.author);
const originalPosterTitle = computed(() => getOriginalPosterTitle({
  author: props.node.author,
  threadAuthor: threadAuthor.value,
  parentAuthor: props.parentAuthor,
}));

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
}
</script>

<template>
  <div 
    class="comment-node"
    :class="[
      node.indent > 0 ? 'comment-node--nested' : 'comment-node--root',
      isCollapsed ? 'comment-node--collapsed' : ''
    ]"
    :id="node.id"
  >
    <div class="comment-node__content-wrap">
      <div class="comment-node__main">
        <OnStoryHeader v-if="node.onStory" class="comment-node__on-story" label="on" :href="node.onStory.link" :title="node.onStory.title" />
        
        <CommentHeader
          :node="node"
          :is-collapsed="isCollapsed"
          :original-poster-title="originalPosterTitle"
          @toggle="toggleCollapse"
        />
        
        <div v-if="!isCollapsed" class="comment-node__body-wrapper">
          <CommentBody
            :html="node.bodyHtml"
            :gray-level="node.grayLevel"
            :placeholder-kind="node.placeholderKind"
          />
          
          <CommentActions
            :item-id="node.id"
            :vote-up="node.voteUp"
            :vote-un="node.voteUn"
            :vote-down="node.voteDown"
            :vote-target="node"
            :reply-link="node.replyLink"
            :flag-url="node.flagUrl"
            :flag-target="node"
          />
        </div>
      </div>
    </div>

    <div v-if="!isCollapsed && node.children && node.children.length > 0" class="comment-node__thread">
      <button class="comment-node__line" @click="toggleCollapse" title="Collapse thread"></button>
      <div class="comment-node__children">
        <ThreadNode 
          v-for="child in node.children" 
          :key="child.id" 
          :node="child" 
          :thread-author="threadAuthor"
          :parent-author="node.author"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/styles/comment-node' as *;

.comment-node {
  @include comment-node-base;

  &--root {
    padding: 0.75rem;
    border-top: 1px solid var(--color-border);

    &:first-child {
      border-top: none;
    }
  }

  &__on-story {
    margin-bottom: 0.35rem;
  }

  &__thread {
    margin-top: 0.35rem;
  }
}
</style>
