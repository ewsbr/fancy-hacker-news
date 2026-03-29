<script setup lang="ts">
import { computed, inject, ref, watch, type Ref } from 'vue';
import type { CommentNode as CommentNodeType } from '@/parsers/item';
import CommentHeader from './CommentHeader.vue';
import CommentBody from './CommentBody.vue';
import SubThreadModal from './SubThreadModal.vue';
import { Triangle, MessageSquare } from 'lucide-vue-next';

// Depth at which children are moved into a modal on mobile.
const MOBILE_MODAL_DEPTH = 4;
const COMMENT_HASH_PATH_IDS_KEY = 'comment-hash-path-ids';

const props = defineProps<{
  node: CommentNodeType;
  /** How many levels deep this node is (0 = top-level). Passed down by parent. */
  depth?: number;
  /** When true (inside a modal) never trigger another modal — render inline. */
  inModal?: boolean;
}>();

const isMobileLayout = inject<boolean>('isMobileLayout', false);
const hashPathIds = inject<Ref<Set<string>>>(COMMENT_HASH_PATH_IDS_KEY, ref(new Set()));

const HEAVY_DOWNVOTE = new Set(['cce', 'cdd']);
const isHeavilyDownvoted = props.node.grayLevel !== null && HEAVY_DOWNVOTE.has(props.node.grayLevel.toLowerCase());
const isCollapsed = ref((props.node.isCollapsed || isHeavilyDownvoted) && !props.node.expandForHash);
const isModalOpen = ref(false);

const currentDepth = props.depth ?? 0;
// Children render in modal when: mobile && deep enough && not already inside a modal.
const childrenInModal = computed(
  () => isMobileLayout
    && !props.inModal
    && currentDepth >= MOBILE_MODAL_DEPTH
    && !hashPathIds.value.has(props.node.id),
);
const directReplyCount = props.node.children.length;
const totalReplyCount = props.node.descendantCount;
const nestedReplyCount = Math.max(0, totalReplyCount - directReplyCount);

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value;
}

watch(
  () => hashPathIds.value.has(props.node.id),
  inHashPath => {
    if (inHashPath) {
      isCollapsed.value = false;
    }
  },
  { immediate: true },
);
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

            <template v-if="node.replyLink">
              <span class="comment-node__action-dot">&middot;</span>
              <a :href="node.replyLink" class="comment-node__action-link">reply</a>
            </template>
            <template v-if="node.flagUrl">
              <span class="comment-node__action-dot">&middot;</span>
              <a :href="node.flagUrl" class="comment-node__action-link">flag</a>
            </template>
          </div>
        </div>
      </div>
    </div>

    <template v-if="!isCollapsed && node.children && node.children.length > 0">
      <!-- Mobile deep thread: show a tap-to-expand button instead of inline children -->
      <button
        v-if="childrenInModal"
        class="comment-node__thread-btn"
        @click="isModalOpen = true"
      >
        <MessageSquare :size="13" />
        <template v-if="nestedReplyCount > 0">
          View {{ directReplyCount }} {{ directReplyCount === 1 ? 'reply' : 'replies' }} ({{ totalReplyCount }} total)
        </template>
        <template v-else>
          View {{ directReplyCount }} {{ directReplyCount === 1 ? 'reply' : 'replies' }}
        </template>
      </button>

      <!-- Normal inline children (desktop, or inside a modal, or shallow depth) -->
      <div v-else class="comment-node__thread">
        <button class="comment-node__line" @click="toggleCollapse" title="Collapse thread"></button>
        <div class="comment-node__children">
          <CommentNode
            v-for="child in node.children"
            :key="child.id"
            :node="child"
            :depth="currentDepth + 1"
            :in-modal="inModal"
          />
        </div>
      </div>
    </template>

    <SubThreadModal
      v-if="isModalOpen"
      :node="node"
      @close="isModalOpen = false"
    />
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
    // Track nesting depth via a CSS counter — used on mobile for the
    // colored left-border depth indicator (see __children below).
    --hn-depth: calc(var(--hn-depth, 0) + 1);
  }

  &__thread-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-top: 0.5rem;
    padding: 0.45rem 0.75rem;
    background: none;
    border: 1px solid var(--color-border);
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-text-muted);
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;

    &:hover {
      border-color: var(--color-accent);
      color: var(--color-accent);
    }
  }

  &__line {
    flex-shrink: 0;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    display: flex;
    justify-content: center;
    padding: 0 16px 0 4px;

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
