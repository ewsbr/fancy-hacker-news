<script setup lang="ts">
import type { CommentRenderableNode } from '@/content/composables/comment-node';
import { MessageSquare } from 'lucide-vue-next';
import { toRefs } from 'vue';
import CommentActions from '@/content/components/comments/CommentActions.vue';
import {
  useCommentCollapseRegistration,
  useCommentDisplayContext,
  useCommentFlagActionTarget,
  useCommentFragmentState,
  useCommentThreadUi,
} from '@/content/composables/comment-node';
import { useCommentCollapse } from '@/state/comment-collapse';
import CommentBody from './CommentBody.vue';
import CommentHeader from './CommentHeader.vue';
import OnStoryHeader from './OnStoryHeader.vue';
import SubThreadModal from './SubThreadModal.vue';

const props = withDefaults(defineProps<{
  node: CommentRenderableNode;
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

const HEAVY_DOWNVOTE = new Set(['cce', 'cdd']);

const {
  depth,
  enableMobileSubthreads,
  inModal,
  node,
  parentAuthor,
  rootVariant,
  showLocalThreadAuthor,
  showOnStory,
  threadAuthor,
} = toRefs(props);

const {
  latestUrl,
  nodeOnStory,
  originalPosterTitle,
  resolvedThreadAuthor,
  rootClassName,
} = useCommentDisplayContext({
  node,
  parentAuthor,
  threadAuthor,
  showLocalThreadAuthor,
  showOnStory,
  rootVariant,
});

const {
  hashNavigationVersion,
  hashTargetId,
  isForcedExpanded,
  isHighlightedForHash,
  isInHashPath,
} = useCommentFragmentState({
  node,
  inModal,
});

const flagTarget = useCommentFlagActionTarget(node);

const initialCollapsed = node.value.isCollapsed || (
  node.value.grayLevel !== null && HEAVY_DOWNVOTE.has(node.value.grayLevel.toLowerCase())
);

const { isCollapsed, toggleCollapse } = useCommentCollapse({
  initialCollapsed,
  forceExpanded: isForcedExpanded,
  hashNavigationVersion,
});

const {
  childrenInModal,
  closeModal,
  currentDepth,
  isModalOpen,
  openModal,
  threadButtonLabel,
} = useCommentThreadUi({
  node,
  depth,
  inModal,
  enableMobileSubthreads,
  isInHashPath,
});

useCommentCollapseRegistration(node, toggleCollapse);
</script>

<template>
  <div
    :id="node.id"
    class="comment-node"
    :class="[
      rootClassName,
      isCollapsed ? 'comment-node--collapsed' : '',
      isHighlightedForHash ? 'comment-node--highlight' : '',
    ]"
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
          :is-flagged="flagTarget?.isFlagged ?? node.isFlagged"
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
                :flag-url="flagTarget?.flagUrl ?? node.flagUrl"
                :flag-target="flagTarget"
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
        @click="openModal"
      >
        <MessageSquare :size="13" />
        {{ threadButtonLabel }}
      </button>

      <div v-else class="comment-node__thread">
        <button class="comment-node__line" type="button" title="Long press to collapse thread" />
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
      @close="closeModal"
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
