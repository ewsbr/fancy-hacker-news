<script setup lang="ts">
import { computed, inject, ref, shallowRef, watch } from 'vue';
import type { CommentNode as CommentNodeType } from '@/parsers/item';
import type { ThreadEntry } from '@/parsers/threads';
import CommentHeader from './CommentHeader.vue';
import SubThreadModal from './SubThreadModal.vue';
import CommentBody from './CommentBody.vue';
import CommentActions from '@/content/components/comments/CommentActions.vue';
import { COMMENT_FRAGMENT_STATE_KEY, type CommentFragmentState } from '@/state/fragment-state';
import { useCommentCollapse } from '@/state/comment-collapse';
import { MessageSquare } from 'lucide-vue-next';
import { COMMENT_THREAD_ROOT_AUTHOR_KEY, COMMENT_THREAD_STORY_AUTHOR_KEY, getOriginalPosterTitle } from '@/content/utils/comment-badges';

const MOBILE_MODAL_DEPTH = 4;
const HEAVY_DOWNVOTE = new Set(['cce', 'cdd']);

const props = withDefaults(defineProps<{
  node: CommentNodeType | ThreadEntry;
  depth?: number;
  inModal?: boolean;
  parentAuthor?: string | null;
  threadAuthor?: string | null;
  showLocalThreadAuthor?: boolean;
  showOnStory?: boolean;
  rootVariant?: 'default' | 'thread';
  enableMobileSubthreads?: boolean;
}>(), {
  showLocalThreadAuthor: false,
  showOnStory: false,
  rootVariant: 'default',
  enableMobileSubthreads: true,
});

// Deliberately a mount-time snapshot. Recomputing this across a very large
// comment tree on breakpoint changes would fan out reactive work to thousands
// of nodes, so resize correctness is traded for tree stability here.
const isMobileLayout = inject<boolean>('isMobileLayout', false);
const injectedThreadAuthor = inject(COMMENT_THREAD_ROOT_AUTHOR_KEY, null);
const storyAuthor = inject(COMMENT_THREAD_STORY_AUTHOR_KEY, null);
const fragmentState = inject<CommentFragmentState>(COMMENT_FRAGMENT_STATE_KEY, {
  hashPathIds: shallowRef(new Set<string>()),
  hashTargetId: ref<string | null>(null),
  mainThreadHashTargetId: ref<string | null>(null),
  hashNavigationVersion: ref(0),
});
const { hashPathIds, hashTargetId, mainThreadHashTargetId, hashNavigationVersion } = fragmentState;

const isModalOpen = ref(false);

const currentDepth = props.depth ?? 0;
const directReplyCount = props.node.children.length;
const totalReplyCount = props.node.descendantCount;
const nestedReplyCount = Math.max(0, totalReplyCount - directReplyCount);
const latestUrl = `latest?id=${encodeURIComponent(props.node.id)}`;
const resolvedThreadAuthor = computed(() => props.threadAuthor
  ?? injectedThreadAuthor
  ?? (props.showLocalThreadAuthor ? props.node.author : null));
const nodeOnStory = computed<{ title: string; link: string } | null>(() => {
  if (!props.showOnStory || !('onStory' in props.node)) {
    return null;
  }

  return props.node.onStory;
});
const originalPosterTitle = computed(() => getOriginalPosterTitle({
  author: props.node.author,
  storyAuthor,
  threadAuthor: resolvedThreadAuthor.value,
  parentAuthor: props.parentAuthor,
}));

const isHashTarget = computed(() => hashTargetId.value === props.node.id);
const isMainThreadHashTarget = computed(() => mainThreadHashTargetId.value === props.node.id);
const isHighlightedForHash = computed(() => (props.inModal ? isHashTarget.value : isMainThreadHashTarget.value));
const isInHashPath = computed(() => props.node.expandForHash || hashPathIds.value.has(props.node.id));
const isForcedExpanded = computed(() => isInHashPath.value && !isHashTarget.value);
const { isCollapsed, toggleCollapse } = useCommentCollapse({
  initialCollapsed: props.node.isCollapsed
    || (props.node.grayLevel !== null && HEAVY_DOWNVOTE.has(props.node.grayLevel.toLowerCase())),
  forceExpanded: isForcedExpanded,
  hashNavigationVersion,
});
const childrenInModal = props.enableMobileSubthreads
  && isMobileLayout
  && !props.inModal
  && currentDepth >= MOBILE_MODAL_DEPTH;

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
        <OnStoryHeader
          v-if="nodeOnStory"
          class="comment-node__on-story"
          label="on"
          :href="nodeOnStory.link"
          :title="nodeOnStory.title"
        />

        <CommentHeader
          class="comment-node__header"
          :node="node"
          :is-collapsed="isCollapsed"
          :latest-url="latestUrl"
          :original-poster-title="originalPosterTitle"
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
                :vote-target="node"
                :reply-link="node.replyLink"
                :edit-url="node.editUrl"
                :delete-url="node.deleteUrl"
                :flag-url="node.flagUrl"
                :flag-target="node"
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
            :parent-author="node.author"
            :thread-author="resolvedThreadAuthor"
            :show-local-thread-author="showLocalThreadAuthor"
            :show-on-story="showOnStory"
            :enable-mobile-subthreads="enableMobileSubthreads"
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
@use '@/styles/comment-node' as *;

.comment-node {
  @include comment-node-base;

  &--thread-root {
    padding: 12px;
    border-top: 1px solid var(--color-border);

    &:first-child {
      border-top: none;
    }
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

  &__on-story {
    margin-bottom: 6px;
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
    margin-top: 7px;
    min-width: 0;
    --hn-depth: calc(var(--hn-depth, 0) + 1);
  }

  &__thread-btn {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    margin-top: 8px;
    padding: 7px 12px;
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
    padding: 0 8px 0 4px;
    margin-right: 8px;
  }
}
</style>
