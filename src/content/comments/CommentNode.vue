<script setup lang="ts">
import { computed, inject, ref, shallowRef, watch } from 'vue';
import type { CommentNode as CommentNodeType } from '@/parsers/item';
import CommentHeader from './CommentHeader.vue';
import SubThreadModal from './SubThreadModal.vue';
import CommentBody from './CommentBody.vue';
import CommentActions from '@/content/ui/composites/CommentActions.vue';
import { COMMENT_FRAGMENT_STATE_KEY, type CommentFragmentState } from '@/state/fragment-state';
import { MessageSquare } from 'lucide-vue-next';

const MOBILE_MODAL_DEPTH = 4;
const HEAVY_DOWNVOTE = new Set(['cce', 'cdd']);

const props = defineProps<{
  node: CommentNodeType;
  depth?: number;
  inModal?: boolean;
}>();

// Deliberately a mount-time snapshot. Recomputing this across a very large
// comment tree on breakpoint changes would fan out reactive work to thousands
// of nodes, so resize correctness is traded for tree stability here.
const isMobileLayout = inject<boolean>('isMobileLayout', false);
const fragmentState = inject<CommentFragmentState>(COMMENT_FRAGMENT_STATE_KEY, {
  hashPathIds: shallowRef(new Set<string>()),
  hashTargetId: ref<string | null>(null),
  mainThreadHashTargetId: ref<string | null>(null),
});
const { hashPathIds, hashTargetId, mainThreadHashTargetId } = fragmentState;

const userCollapsed = ref(
  props.node.isCollapsed || (props.node.grayLevel !== null && HEAVY_DOWNVOTE.has(props.node.grayLevel)),
);
const isModalOpen = ref(false);

const currentDepth = props.depth ?? 0;
const directReplyCount = props.node.children.length;
const totalReplyCount = props.node.descendantCount;
const nestedReplyCount = Math.max(0, totalReplyCount - directReplyCount);
const latestUrl = `latest?id=${encodeURIComponent(props.node.id)}`;

const isHashTarget = computed(() => hashTargetId.value === props.node.id);
const isMainThreadHashTarget = computed(() => mainThreadHashTargetId.value === props.node.id);
const isHighlightedForHash = computed(() => (props.inModal ? isHashTarget.value : isMainThreadHashTarget.value));
const isInHashPath = computed(() => props.node.expandForHash || hashPathIds.value.has(props.node.id));
const isForcedExpanded = computed(() => isInHashPath.value && !isHashTarget.value);
const isCollapsed = computed(() => !isForcedExpanded.value && userCollapsed.value);
const childrenInModal = isMobileLayout && !props.inModal && currentDepth >= MOBILE_MODAL_DEPTH;

function toggleCollapse() {
  userCollapsed.value = !isCollapsed.value;
}

if (childrenInModal) {
  watch(
    isInHashPath,
    inHashPath => {
      if (inHashPath) {
        isModalOpen.value = true;
      }
    },
    { immediate: true },
  );
}
</script>

<template>
  <div
    class="comment-node"
    :class="[
      node.indent > 0 ? 'comment-node--nested' : 'comment-node--root',
      isCollapsed ? 'comment-node--collapsed' : '',
      isHighlightedForHash ? 'comment-node--highlight' : '',
    ]"
    :id="node.id"
  >
    <div class="comment-node__content-wrap">
      <div class="comment-node__main">
        <CommentHeader
          class="comment-node__header"
          :node="node"
          :is-collapsed="isCollapsed"
          :latest-url="latestUrl"
          @toggle="toggleCollapse"
        />

        <template v-if="!isCollapsed">
          <div class="comment-node__body-wrapper">
            <CommentBody
              :html="node.bodyHtml"
              :gray-level="node.grayLevel"
              :placeholder-kind="node.placeholderKind"
            />

            <div class="comment-node__actions">
              <CommentActions
                :item-id="node.id"
                :vote-up="node.voteUp"
                :vote-un="node.voteUn"
                :vote-down="node.voteDown"
                :reply-link="node.replyLink"
                :edit-url="node.editUrl"
                :delete-url="node.deleteUrl"
                :flag-url="node.flagUrl"
              />
            </div>
          </div>
        </template>
      </div>
    </div>

    <template v-if="!isCollapsed && node.children.length > 0">
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

      <div v-else class="comment-node__thread">
        <button class="comment-node__line" title="Collapse thread" @click="toggleCollapse"></button>
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
      :scroll-to-id="hashTargetId"
      @close="isModalOpen = false"
    />
  </div>
</template>

<style scoped lang="scss">
@use '../../styles/comment-node' as *;

.comment-node {
  @include comment-node-base;

  &--root {
    margin-top: 0.5rem;
  }

  &--highlight {
    animation: highlight-fade 5s forwards;

    &::before {
      content: "";
      position: absolute;
      top: -4px;
      bottom: -4px;
      left: -10px;
      width: 10px;
      background: inherit;
      border-left: 2px solid var(--color-accent);
      animation: highlight-line-fade 5s forwards;
    }
  }

  &__body-wrapper {
    margin-top: 0.1rem;
  }

  &__actions {
    margin-top: 0.2rem;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--color-text-muted);
    flex-wrap: wrap;
  }

  &__votes {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.7rem;
    margin-right: 0.1rem;
  }

  &__vote {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    color: var(--color-text-muted);
    transition: color 0.15s ease;
    font-size: 0.8rem;
    font-weight: 600;
    position: relative;
    text-decoration: none;

    &::before {
      content: "";
      position: absolute;
      inset: -5px;
    }

    &:hover {
      color: var(--color-accent);
      text-decoration: none;
    }

    &--active {
      color: var(--color-accent);
    }

    &--hidden {
      display: none;
    }

    &--down .comment-node__vote-chevron {
      transform: rotate(180deg);
    }
  }

  &__unvote-slot {
    display: inline-flex;
    align-items: center;
  }

  &__vote-chevron {
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 8px solid currentColor;
  }

  &__action-link {
    position: relative;
    color: inherit;
    text-decoration: none;

    &::before {
      content: "";
      position: absolute;
      inset: -5px -4px;
    }

    &:hover {
      color: var(--color-text);
      text-decoration: underline;
    }

    &--delete:hover {
      color: #ff3e00;
    }
  }

  &__thread {
    margin-top: 0.45rem;
    min-width: 0;
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
    padding: 0 16px 0 4px;
  }
}
</style>
