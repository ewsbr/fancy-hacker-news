<script setup lang="ts">
import { ref } from 'vue';
import type { CommentNode as CommentNodeType } from '@/parsers/item';
import CommentHeader from './CommentHeader.vue';
import CommentBody from './CommentBody.vue';

const props = defineProps<{
  node: CommentNodeType;
}>();

const isCollapsed = ref(props.node.isCollapsed);

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
      <div 
        class="comment-node__vote" 
        :class="{ 'comment-node__vote--hidden': isCollapsed }"
      >
        <template v-if="node.voteUp || node.voteDown || node.voteUn">
          <a v-if="node.voteUp" :href="node.voteUp" class="comment-node__vote-btn comment-node__vote-btn--up">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
          </a>
          <a v-if="node.voteDown" :href="node.voteDown" class="comment-node__vote-btn comment-node__vote-btn--down">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </a>
        </template>
      </div>
      
      <div class="comment-node__main">
        <CommentHeader :node="{...node, isCollapsed}" @toggle="toggleCollapse" />
        
        <div v-show="!isCollapsed" class="comment-node__body-wrapper">
          <CommentBody :html="node.bodyHtml" :gray-level="node.grayLevel" />
          
          <div class="comment-node__actions" v-if="node.replyLink || node.flagUrl">
            <a v-if="node.replyLink" :href="node.replyLink" class="comment-node__action-link">reply</a>
            <a v-if="node.flagUrl" :href="node.flagUrl" class="comment-node__action-link">flag</a>
          </div>
        </div>
      </div>
    </div>

    <div v-show="!isCollapsed" v-if="node.children && node.children.length > 0" class="comment-node__thread">
      <button class="comment-node__line" @click="toggleCollapse" title="Collapse thread"></button>
      <div class="comment-node__children">
        <CommentNode 
          v-for="child in node.children" 
          :key="child.id" 
          :node="child" 
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.comment-node {
  &--root {
    margin-top: 1rem;
  }

  &--nested {
    margin-top: 0.75rem;
  }

  &--collapsed {
    > .comment-node__content-wrap {
      opacity: 0.8;
    }
  }

  &__content-wrap {
    display: flex;
    gap: 0.5rem;
  }

  &__vote {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 24px;
    flex-shrink: 0;
    padding-top: 0.125rem;

    &--hidden {
      visibility: hidden;
    }
  }

  &__vote-btn {
    color: var(--color-muted);
    cursor: pointer;
    text-decoration: none;

    &:hover {
      color: var(--color-accent);
    }

    svg {
      transition: transform 0.2s ease;
    }

    &--up:hover svg {
      transform: translateY(-2px);
    }
    
    &--down {
      margin-top: 0.25rem;
      
      &:hover svg {
        transform: translateY(2px);
      }
    }
  }

  &__main {
    flex: 1;
    min-width: 0;
  }

  &__body-wrapper {
    margin-top: 0.5rem;
  }

  &__actions {
    margin-top: 0.5rem;
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

  &__thread {
    display: flex;
    margin-top: 0.5rem;
  }

  &__line {
    width: 24px;
    flex-shrink: 0;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    display: flex;
    justify-content: center;

    &::after {
      content: "";
      width: 2px;
      background-color: var(--color-border);
      opacity: 0.4;
      transition: background-color 0.2s, opacity 0.2s;
    }

    &:hover::after {
      background-color: var(--color-accent);
      opacity: 1;
    }
  }

  &__children {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    padding-left: 0.5rem;
  }
}
</style>
