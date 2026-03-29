<script setup lang="ts">
import { ref } from 'vue';
import type { CommentNode as CommentNodeType } from '@/parsers/item';
import CommentHeader from './CommentHeader.vue';
import CommentBody from './CommentBody.vue';
import { Triangle } from 'lucide-vue-next';

const props = defineProps<{
  node: CommentNodeType;
}>();

const HEAVY_DOWNVOTE = new Set(['cce', 'cdd']);
const isHeavilyDownvoted = props.node.grayLevel !== null && HEAVY_DOWNVOTE.has(props.node.grayLevel.toLowerCase());
const isCollapsed = ref(props.node.isCollapsed || isHeavilyDownvoted);

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
        <CommentHeader :node="node" :is-collapsed="isCollapsed" @toggle="toggleCollapse" />

        <div v-if="!isCollapsed" class="comment-node__body-wrapper">
          <CommentBody :html="node.bodyHtml" :gray-level="node.grayLevel" />
          
          <div class="comment-node__actions">
            <div class="comment-node__votes">
              <a 
                v-if="node.voteUp || node.voteUn" 
                :href="node.voteUn || node.voteUp || undefined" 
                class="comment-node__vote-action"
                :class="{ 
                  'comment-node__vote-action--up': true, 
                  'comment-node__vote-action--active': node.voteUn 
                }"
                :title="node.voteUn ? 'unvote' : 'upvote'"
              >
                <Triangle :size="10" fill="currentColor" :stroke-width="0" />
                <span>{{ node.voteUn ? 'unvote' : 'upvote' }}</span>
              </a>
              <a 
                v-if="node.voteDown" 
                :href="node.voteDown" 
                class="comment-node__vote-action comment-node__vote-action--down"
                title="downvote"
              >
                <Triangle :size="10" fill="currentColor" :stroke-width="0" />
                <span>downvote</span>
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

    <div v-if="!isCollapsed && node.children && node.children.length > 0" class="comment-node__thread">
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
  position: relative;

  &--root {
    margin-top: 0.5rem;
  }

  // Handle sticky header offset for fragment navigation
  scroll-margin-top: 50px;

  &:target {
    animation: highlight-fade 1.5s forwards;

    &::before {
      content: "";
      position: absolute;
      top: -4px;
      bottom: -4px;
      left: -10px;
      width: 10px;
      background: inherit;
      border-left: 2px solid color-mix(in srgb, var(--color-accent) 60%, transparent);
      animation: highlight-line-fade 1.5s forwards;
    }
  }

  &--highlight {
    animation: highlight-fade 1.5s forwards;

    &::before {
      content: "";
      position: absolute;
      top: -4px;
      bottom: -4px;
      left: -10px;
      width: 10px;
      background: inherit;
      border-left: 2px solid var(--color-accent);
      animation: highlight-line-fade 1.5s forwards;
    }
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
    margin-top: 0.2rem;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-text-muted);
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

  &__action-dot {
    color: var(--color-text-muted);
    font-weight: 900;
    opacity: 0.5;
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

  &__thread {
    display: flex;
    margin-top: 0.45rem;
    min-width: 0;
    // Increment nesting depth so deeply-nested comments get progressively
    // less indentation, keeping text readable on narrow viewports.
    --hn-depth: calc(var(--hn-depth, 0) + 1);
  }

  &__line {
    flex-shrink: 0;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    display: flex;
    justify-content: center;
    // Base indent is 10px. For each level beyond depth 6 it shrinks by 2px,
    // reaching 0 at depth 11+. Total indent at depth 15 ≈ 80px vs 330px before.
    padding-inline-start: 2px;
    padding-inline-end: clamp(0px, calc(10px - max(0px, calc((var(--hn-depth, 0) - 6) * 2px))), 10px);

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
    gap: 0.75rem;
  }
}

@keyframes highlight-fade {
  0%, 60% {
    background: color-mix(in srgb, var(--color-accent) 3%, transparent);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-accent) 3%, transparent);
  }
  100% {
    background: transparent;
    box-shadow: 0 0 0 4px transparent;
  }
}

@keyframes highlight-line-fade {
  0%, 60% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
