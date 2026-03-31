<script setup lang="ts">
import { ref } from 'vue';
import type { ThreadEntry } from '@/parsers/threads';
import CommentHeader from './CommentHeader.vue';
import CommentBody from './CommentBody.vue';
import { Triangle } from 'lucide-vue-next';

const props = defineProps<{
  node: ThreadEntry;
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
        <div v-if="node.onStory" class="comment-node__on-story">
          <span class="comment-node__on-story-label">on</span>
          <a :href="node.onStory.link" class="comment-node__on-story-link">{{ node.onStory.title }}</a>
        </div>
        
        <CommentHeader :node="node" :is-collapsed="isCollapsed" @toggle="toggleCollapse">
          <!-- Inject additional nav links exactly as they appear in threads -->
          <template #extra-nav>
            <span v-if="node.navLinks.parent" class="comment-node__extra-nav">
              <span class="comment-node__extra-nav-sep">&middot;</span> <a :href="node.navLinks.parent">parent</a>
            </span>
            <span v-if="node.navLinks.next" class="comment-node__extra-nav">
              <span class="comment-node__extra-nav-sep">&middot;</span> <a :href="node.navLinks.next">next</a>
            </span>
            <span v-if="node.navLinks.context" class="comment-node__extra-nav">
              <span class="comment-node__extra-nav-sep">&middot;</span> <a :href="node.navLinks.context">context</a>
            </span>
          </template>
        </CommentHeader>
        
        <div v-if="!isCollapsed" class="comment-node__body-wrapper">
          <CommentBody :html="node.bodyHtml" :gray-level="node.grayLevel" />
          
          <div class="comment-node__actions">
            <div class="comment-node__votes">
              <a 
                v-if="node.voteUp || node.voteUn" 
                :href="node.voteUn || node.voteUp || ''" 
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
        <ThreadNode 
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
    padding: 0.75rem;
    border-top: 1px solid var(--color-border);

    &:first-child {
      border-top: none;
    }
  }

  // Handle sticky header offset for fragment navigation
  scroll-margin-top: 50px;

  &:target {
    animation: highlight-fade 5s forwards;

    &::before {
      content: "";
      position: absolute;
      top: -4px;
      bottom: -4px;
      left: -10px;
      width: 10px;
      background: inherit;
      border-left: 2px solid color-mix(in srgb, var(--color-accent) 60%, transparent);
      animation: highlight-line-fade 5s forwards;
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

  &__on-story {
    margin-bottom: 0.35rem;
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
    font-size: 0.85rem;
    line-height: 1.4;

    &-label {
      font-size: 0.7rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--color-text-muted);
      flex-shrink: 0;
    }

    &-link {
      color: var(--color-accent-muted);
      text-decoration: none;
      font-size: 0.9rem;
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__extra-nav {
    color: var(--color-border);
    margin-left: 0.3rem;
    
    &-sep {
      color: var(--color-text-muted);
      font-weight: 900;
      opacity: 0.5;
      user-select: none;
    }
  }

  &__actions {
    margin-top: 0.5rem;
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
    gap: 0.75rem;
  }
}

@keyframes highlight-fade {
  0%, 80% {
    background: color-mix(in srgb, var(--color-accent) 3%, transparent);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--color-accent) 3%, transparent);
  }
  100% {
    background: transparent;
    box-shadow: 0 0 0 4px transparent;
  }
}

@keyframes highlight-line-fade {
  0%, 80% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
