<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue';
import type { CommentNode as CommentNodeType } from '@/parsers/item';
import SubThreadModal from './SubThreadModal.vue';
import CommentBody from './CommentBody.vue';
import CommentActions from '@/content/shared/CommentActions.vue';
import { COMMENT_FRAGMENT_STATE_KEY, type CommentFragmentState } from '@/state/fragmentState';
import { INITIAL_RENDER_PAINTED_KEY } from '@/state/initialRender';
import { ChevronLeft, ChevronRight, MessageSquare } from 'lucide-vue-next';
import FragmentLinkButton from '@/content/shared/FragmentLinkButton.vue';
import MetaSep from '@/content/shared/MetaSep.vue';
import CommentUserMeta from '@/content/shared/CommentUserMeta.vue';
import { recordBatchFrame } from '@/debug';
import {
  CHILD_FRAME_RENDER_BUDGET,
  CHILD_INITIAL_RENDER_BUDGET,
  nextVisibleNodeCount,
  requiredVisibleNodeCount,
  shouldProgressivelyRenderChildren as shouldBatchChildren,
} from './progressiveRender';
import {
  COMMENT_ACTION_STATE_KEY,
  createCommentActionStateStore,
  getCommentActionState,
} from '@/state/itemPageState';

const MOBILE_MODAL_DEPTH = 4;
const HEAVY_DOWNVOTE = new Set(['cce', 'cdd']);
const DOWNVOTE_LABELS: Record<string, string> = {
  c5a: '1/9',
  c73: '2/9',
  c82: '3/9',
  c88: '4/9',
  c9c: '5/9',
  cae: '6/9',
  cbe: '7/9',
  cce: '8/9',
  cdd: '9/9',
};

const props = defineProps<{
  node: CommentNodeType;
  depth?: number;
  inModal?: boolean;
}>();

const isMobileLayout = inject<boolean>('isMobileLayout', false);
const fragmentState = inject<CommentFragmentState>(COMMENT_FRAGMENT_STATE_KEY, {
  hashPathIds: ref(new Set<string>()),
  hashTargetId: ref<string | null>(null),
  mainThreadHashTargetId: ref<string | null>(null),
});
const commentActionStates = inject(COMMENT_ACTION_STATE_KEY, createCommentActionStateStore());
const { hashPathIds, hashTargetId, mainThreadHashTargetId } = fragmentState;
const initialRenderPainted = inject(INITIAL_RENDER_PAINTED_KEY, ref(true));

const userCollapsed = ref(
  props.node.isCollapsed || (props.node.grayLevel !== null && HEAVY_DOWNVOTE.has(props.node.grayLevel)),
);
const isModalOpen = ref(false);
const actionState = getCommentActionState(commentActionStates, props.node);

const currentDepth = props.depth ?? 0;
const childrenInModal = isMobileLayout && !props.inModal && currentDepth >= MOBILE_MODAL_DEPTH;
const directReplyCount = props.node.children.length;
const totalReplyCount = props.node.descendantCount;
const nestedReplyCount = Math.max(0, totalReplyCount - directReplyCount);
const downvoteOpacity = props.node.grayLevel ? DOWNVOTE_LABELS[props.node.grayLevel] || null : null;
const latestUrl = computed(() => `latest?id=${encodeURIComponent(props.node.id)}`);

const isHashTarget = computed(() => hashTargetId.value === props.node.id);
const isMainThreadHashTarget = computed(() => mainThreadHashTargetId.value === props.node.id);
const isHighlightedForHash = computed(() => (props.inModal ? isHashTarget.value : isMainThreadHashTarget.value));
const isInHashPath = computed(() => props.node.expandForHash || hashPathIds.value.has(props.node.id));
const isForcedExpanded = computed(() => isInHashPath.value && !isHashTarget.value);
const isCollapsed = computed(() => !isForcedExpanded.value && userCollapsed.value);
const hasHeaderNav = computed(() => !!(
  latestUrl.value
  || props.node.navLinks.root
  || props.node.navLinks.parent
  || props.node.navLinks.prev
  || props.node.navLinks.next
  || props.node.navLinks.context
));
const shouldProgressivelyRenderChildren = shouldBatchChildren(props.node.descendantCount, props.inModal);
const visibleChildCount = ref(props.node.children.length);

let childBatchFrameId: number | null = null;

function requiredChildCount(): number {
  return requiredVisibleNodeCount(props.node.children, hashPathIds.value);
}

function extendVisibleChildren(budget: number) {
  if (!shouldProgressivelyRenderChildren || visibleChildCount.value >= props.node.children.length || isCollapsed.value) {
    visibleChildCount.value = props.node.children.length;
    return;
  }

  const nextCount = nextVisibleNodeCount(props.node.children, visibleChildCount.value, budget);
  visibleChildCount.value = Math.min(
    props.node.children.length,
    Math.max(nextCount, requiredChildCount()),
  );
}

function queueNextChildBatch() {
  if (
    !shouldProgressivelyRenderChildren
    || !initialRenderPainted.value
    || visibleChildCount.value >= props.node.children.length
    || isCollapsed.value
    || childBatchFrameId !== null
  ) {
    return;
  }

  childBatchFrameId = requestAnimationFrame(() => {
    childBatchFrameId = null;
    const beforeCount = visibleChildCount.value;
    const startedAt = performance.now();
    extendVisibleChildren(CHILD_FRAME_RENDER_BUDGET);
    recordBatchFrame('comments:child-batches', {
      durationMs: performance.now() - startedAt,
      beforeCount,
      afterCount: visibleChildCount.value,
      totalCount: props.node.children.length,
    });
    queueNextChildBatch();
  });
}

if (shouldProgressivelyRenderChildren) {
  visibleChildCount.value = Math.min(
    props.node.children.length,
    Math.max(nextVisibleNodeCount(props.node.children, 0, CHILD_INITIAL_RENDER_BUDGET), requiredChildCount()),
  );
}

const visibleChildren = computed(() =>
  shouldProgressivelyRenderChildren && !isCollapsed.value
    ? props.node.children.slice(0, visibleChildCount.value)
    : props.node.children,
);

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

watch(
  initialRenderPainted,
  painted => {
    if (!painted || isCollapsed.value) {
      return;
    }

    queueNextChildBatch();
  },
  { immediate: true },
);

watch(
  isCollapsed,
  collapsed => {
    if (!shouldProgressivelyRenderChildren) {
      return;
    }

    if (collapsed) {
      if (childBatchFrameId !== null) {
        cancelAnimationFrame(childBatchFrameId);
        childBatchFrameId = null;
      }
      return;
    }

    const nextRequiredChildCount = requiredChildCount();
    if (nextRequiredChildCount > visibleChildCount.value) {
      visibleChildCount.value = nextRequiredChildCount;
    }

    queueNextChildBatch();
  },
  { immediate: true },
);

watch(
  () => hashPathIds.value,
  () => {
    if (!shouldProgressivelyRenderChildren || isCollapsed.value) {
      return;
    }

    const nextRequiredChildCount = requiredChildCount();
    if (nextRequiredChildCount > visibleChildCount.value) {
      visibleChildCount.value = nextRequiredChildCount;
    }

    queueNextChildBatch();
  },
);
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
        <div class="comment-node__header">
          <button
            class="comment-node__toggle"
            :class="{ 'comment-node__toggle--collapsed': isCollapsed }"
            @click="toggleCollapse"
          >
            {{ isCollapsed ? (node.collapsedCount > 0 ? `[+${node.collapsedCount}]` : '[show]') : '[–]' }}
          </button>

          <div class="comment-node__header-info">
            <CommentUserMeta
              :author="node.author"
              :author-is-new="node.authorIsNew"
              :score="node.score"
              :age-link="node.ageLink"
              :age="node.age"
              :age-timestamp="node.ageTimestamp"
              :is-deleted="node.isDeleted"
              :is-dead="node.isDead"
              :is-flagged="actionState.isFlagged"
              :downvote-label="downvoteOpacity"
            />

            <div v-if="!node.isDeleted && !isCollapsed && hasHeaderNav" class="comment-node__nav">
              <MetaSep />
              <a :href="latestUrl" class="comment-node__nav-link">latest</a>
              <a v-if="node.navLinks.root" :href="node.navLinks.root" class="comment-node__nav-link">root</a>
              <a v-if="node.navLinks.parent" :href="node.navLinks.parent" class="comment-node__nav-link">parent</a>
              <a v-if="node.navLinks.context" :href="node.navLinks.context" class="comment-node__nav-link">context</a>
            </div>

            <div class="comment-node__controls">
              <MetaSep class="comment-node__controls-sep" />
              <a
                v-if="!node.isDeleted && !isCollapsed && node.navLinks.prev"
                :href="node.navLinks.prev"
                class="comment-node__icon-link"
                title="Previous comment"
                aria-label="Previous comment"
              >
                <ChevronLeft :size="14" aria-hidden="true" />
              </a>
              <FragmentLinkButton :target-id="node.id" />
              <a
                v-if="!node.isDeleted && !isCollapsed && node.navLinks.next"
                :href="node.navLinks.next"
                class="comment-node__icon-link"
                title="Next comment"
                aria-label="Next comment"
              >
                <ChevronRight :size="14" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

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
                :vote-un="actionState.voteUn"
                :vote-down="node.voteDown"
                :vote-target="actionState"
                :reply-link="node.replyLink"
                :edit-url="node.editUrl"
                :delete-url="node.deleteUrl"
                :flag-url="actionState.flagUrl"
                :flag-target="actionState"
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
            v-for="child in visibleChildren"
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

  &__header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    column-gap: 0.35rem;
    row-gap: 0.2rem;
    font-size: 0.84rem;
    color: var(--color-text-muted);
  }

  &__toggle {
    align-self: flex-start;
    margin-right: 0.15rem;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    position: relative;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--color-text-muted);
    transition: color 0.15s ease;

    &::before {
      content: "";
      position: absolute;
      inset: -4px;
    }

    &:hover,
    &:focus {
      color: var(--color-accent);
      text-decoration: none;
      outline: none;
    }

    &--collapsed {
      color: var(--color-accent);
    }
  }

  &__header-info {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    column-gap: 0.5rem;
    row-gap: 0.1rem;
    flex: 1;
    min-width: 0;
  }

  &__author {
    font-weight: 600;
    color: var(--color-text);
    text-decoration: none;

    &:hover {
      color: var(--color-accent);
      text-decoration: underline;
    }
  }

  &__age-link {
    color: inherit;
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }

  &__score {
    color: inherit;
    font-weight: 500;
  }

  &__badges {
    display: flex;
    align-items: center;
    gap: 0.2rem;
    align-self: center;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.1rem 0.35rem;
    font-family: var(--font-mono);
    font-size: 0.65rem;
    font-weight: 700;
    line-height: 1;
    letter-spacing: 0.05em;
    border-radius: 2px;
    white-space: nowrap;
    border: 1px solid transparent;
    text-transform: uppercase;

    &--new {
      background: color-mix(in srgb, var(--color-new-user) 15%, transparent);
      color: var(--color-new-user);
      border-color: color-mix(in srgb, var(--color-new-user) 30%, transparent);
    }

    &--dead {
      background: color-mix(in srgb, var(--color-text-muted) 10%, transparent);
      color: var(--color-text-muted);
      border-color: color-mix(in srgb, var(--color-text-muted) 20%, transparent);
      text-decoration: line-through;
    }

    &--flagged {
      background: color-mix(in srgb, #ff3e00 10%, transparent);
      color: #ff3e00;
      border-color: color-mix(in srgb, #ff3e00 20%, transparent);
    }

    &--deleted {
      background: color-mix(in srgb, var(--color-text-muted) 8%, transparent);
      color: var(--color-text-muted);
      border-color: color-mix(in srgb, var(--color-text-muted) 18%, transparent);
    }

    &--downvoted {
      background: color-mix(in srgb, var(--color-downvoted) 15%, transparent);
      color: var(--color-downvoted);
      border-color: color-mix(in srgb, var(--color-downvoted) 30%, transparent);
      text-transform: none;
      font-weight: 600;
    }
  }

  &__nav {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5rem;
    font-size: 0.74rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--color-text-muted);
    opacity: 0.5;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 1;
    }

    @media (max-width: 640px) {
      display: none;
    }
  }

  &__controls {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    flex-wrap: nowrap;
    white-space: nowrap;
  }

  &__nav-link {
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
      text-decoration: none;
    }
  }

  &__icon-link {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1rem;
    color: inherit;
    text-decoration: none;
    opacity: 0.72;
    line-height: 0;
    transition: color 0.15s ease, opacity 0.15s ease, transform 0.15s ease;

    &::before {
      content: "";
      position: absolute;
      inset: -6px;
    }

    &:hover {
      color: var(--color-text);
      opacity: 1;
      text-decoration: none;
      transform: translateY(-1px);
    }
  }

  &__deleted-meta,
  &__deleted-label {
    font-style: italic;
    color: var(--color-text-muted);
  }

  &__deleted-meta {
    opacity: 0.6;
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

  @media (max-width: 640px) {
    &__header {
      font-size: 0.96rem;
      column-gap: 0.45rem;
      row-gap: 0.28rem;
    }

    &__toggle {
      font-size: 0.86rem;
    }

    &__header-info {
      column-gap: 0.6rem;
      row-gap: 0.22rem;
    }

    &__controls {
      gap: 0.7rem;
    }

    &__controls-sep {
      display: none;
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
