<script setup lang="ts">
import { ref } from 'vue';
import type { CommentNode as CommentNodeType } from '@/parsers/item';
import CommentHeader from './CommentHeader.vue';
import CommentBody from './CommentBody.vue';
import { ChevronUp, ChevronDown } from 'lucide-vue-next';

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
      <div class="comment-node__main">
        <CommentHeader :node="{...node, isCollapsed}" @toggle="toggleCollapse" />
        
        <div v-show="!isCollapsed" class="comment-node__body-wrapper">
          <CommentBody :html="node.bodyHtml" :gray-level="node.grayLevel" />
          
          <div class="comment-node__actions">
            <div class="comment-node__votes">
              <a 
                v-if="node.voteUp || node.voteUn" 
                :href="node.voteUn || node.voteUp || undefined" 
                class="comment-node__vote-action"
                :class="{ 'comment-node__vote-action--active': node.voteUn }"
                :title="node.voteUn ? 'unvote' : 'upvote'"
              >
                <ChevronUp :size="16" :stroke-width="node.voteUn ? 3 : 2.5" />
              </a>
              <a 
                v-if="node.voteDown" 
                :href="node.voteDown" 
                class="comment-node__vote-action"
                title="downvote"
              >
                <ChevronDown :size="16" :stroke-width="2.5" />
              </a>
            </div>

            <span class="comment-node__action-dot">&middot;</span>
            <a v-if="node.replyLink" :href="node.replyLink" class="comment-node__action-link">reply</a>
            <template v-if="node.flagUrl">
              <span class="comment-node__action-dot">&middot;</span>
              <a :href="node.flagUrl" class="comment-node__action-link">flag</a>
            </template>
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
    margin-top: 0.5rem;
  }

  &--nested {
    margin-top: 0.2rem;
  }

  // Handle sticky header offset for fragment navigation
  scroll-margin-top: 50px;

  &:target {
    background: color-mix(in srgb, var(--color-accent) 3%, transparent);
    box-shadow: inset 2px 0 0 color-mix(in srgb, var(--color-accent) 60%, transparent);
    transition: background 0.6s ease, box-shadow 0.6s ease;
  }

  &--highlight {
    // Legacy JS highlight - keeping for now to avoid breaking transition if still referenced
    background: color-mix(in srgb, var(--color-accent) 3%, transparent);
    box-shadow: inset 3px 0 0 var(--color-accent);
    transition: background 0.4s ease, box-shadow 0.4s ease;
  }

  &--collapsed {
    > .comment-node__content-wrap {
      opacity: 0.8;
    }
  }

  &__content-wrap {
    display: flex;
    align-items: flex-start;
  }


  &__main {
    flex: 1;
    min-width: 0;
  }

  &__body-wrapper {
    margin-top: 0.2rem;
  }

  &__actions {
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-muted);
  }

  &__votes {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  &__vote-action {
    display: flex;
    align-items: center;
    justify-content: center;
    color: inherit;
    transition: color 0.15s ease, transform 0.15s ease;

    &:hover {
      color: var(--color-accent);
      transform: translateY(-1px);
    }

    &[title="downvote"]:hover {
      transform: translateY(1px);
    }

    &--active {
      color: var(--color-accent);
    }
  }

  &__action-dot {
    color: var(--color-border);
    opacity: 0.5;
    user-select: none;
    margin: 0 0.1rem;
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
    margin-top: 0.35rem;
  }

  &__line {
    width: 20px;
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
      opacity: 0.5;
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
  }
}
</style>
