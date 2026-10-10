<script setup lang="ts">
import type { FragmentLoadingTask } from '@/content/composables/comment-fragment-loading';
import type { ParsedItemPage } from '@/parsers/item';
import { useEventListener } from '@vueuse/core';
import { computed, inject, nextTick, onMounted, provide, ref, shallowRef, useTemplateRef } from 'vue';
import CommentActions from '@/content/components/comments/CommentActions.vue';
import CommentBody from '@/content/components/comments/CommentBody.vue';
import CommentTree from '@/content/components/comments/CommentTree.vue';
import CommentUserMeta from '@/content/components/comments/CommentUserMeta.vue';
import FlagButton from '@/content/components/comments/FlagButton.vue';
import FragmentLoading from '@/content/components/comments/FragmentLoading.vue';
import OnStoryHeader from '@/content/components/comments/OnStoryHeader.vue';
import CommentForm from '@/content/components/forms/CommentForm.vue';
import FragmentLinkButton from '@/content/components/shared/FragmentLinkButton.vue';
import InlineActionLink from '@/content/components/shared/InlineActionLink.vue';
import PollOptions from '@/content/components/stories/PollOptions.vue';
import StoryDetail from '@/content/components/stories/StoryDetail.vue';
import Badge from '@/content/components/ui/Badge.vue';
import MetaSep from '@/content/components/ui/MetaSep.vue';
import { provideCommentFragmentLoading } from '@/content/composables/comment-fragment-loading';
import { useCurrentUser } from '@/content/composables/current-user';
import {
  COMMENT_THREAD_ROOT_AUTHOR_KEY,
  COMMENT_THREAD_STORY_AUTHOR_KEY,
  getOriginalPosterTitle,
} from '@/content/utils/comment-badges';
import { getExtensionRootHost } from '@/content/utils/root-host';
import { waitForAnimationFrame, waitForLayoutToSettle } from '@/content/utils/wait';
import { createLogger } from '@/debug';
import { getToggleActionHref } from '@/parsers/shared/actions';
import { COMMENT_FRAGMENT_STATE_KEY } from '@/state/fragment-state';
import { findCommentPath } from '@/state/item-page-state';

const commentsLogger = createLogger('comments');

const pageData = inject<ParsedItemPage>('pageData')!;
const commentTreeRef = useTemplateRef('commentTree');
const fragmentLoading = provideCommentFragmentLoading();
const currentUser = useCurrentUser();
const isCommentItem = pageData.item.type === 'comment';

const latestUrl = `latest?id=${encodeURIComponent(pageData.item.id)}`;
const itemFavoriteHref = computed(() => getToggleActionHref(pageData.item.favoriteAction));
const itemFlagHref = computed(() => getToggleActionHref(pageData.item.flagAction));
const loginUrl = currentUser.loginUrl ?? 'login';
const commentItemOriginalPosterTitle = isCommentItem
  ? getOriginalPosterTitle({ author: pageData.item.author, threadAuthor: pageData.item.author })
  : null;
const totalCommentCount = pageData.comments.reduce((sum, c) => sum + 1 + c.descendantCount, 0);

function getStoryReplyState(): 'dead' | 'login' | 'unavailable' | null {
  if (pageData.item.type !== 'story' || pageData.replyForm) {
    return null;
  }
  if (pageData.item.isDead) {
    return 'dead';
  }
  return currentUser.isLoggedIn ? 'unavailable' : 'login';
}
const storyReplyState = getStoryReplyState();

const hashPathIds = shallowRef(new Set<string>());
const hashTargetId = ref<string | null>(null);
const mainThreadHashTargetId = ref<string | null>(null);
const hashNavigationVersion = ref(0);

provide(COMMENT_FRAGMENT_STATE_KEY, { hashPathIds, hashTargetId, mainThreadHashTargetId, hashNavigationVersion });
provide(COMMENT_THREAD_STORY_AUTHOR_KEY, pageData.item.type === 'story' ? pageData.item.author : null);
provide(COMMENT_THREAD_ROOT_AUTHOR_KEY, isCommentItem ? pageData.item.author : null);

function findRenderedHashTarget(targetId: string, excludeModal: boolean): HTMLElement | null {
  const matches = getExtensionRootHost()?.querySelectorAll<HTMLElement>(`#${CSS.escape(targetId)}`) ?? [];
  return Array.from(matches).find(match => !excludeModal || !match.closest('.sub-thread-modal')) ?? null;
}

async function waitForRenderedHashTarget(
  targetIds: string[],
  isCurrent: () => boolean,
  excludeModal = false,
): Promise<{ element: HTMLElement; targetId: string } | null> {
  for (let attempt = 0; attempt < 36 && isCurrent(); attempt += 1) {
    for (const targetId of targetIds) {
      const element = findRenderedHashTarget(targetId, excludeModal);
      if (element) {
        return { element, targetId };
      }
    }

    await waitForAnimationFrame();
  }

  return null;
}

function scrollMainPageTarget(target: HTMLElement) {
  const scrollAnchor = target.querySelector<HTMLElement>('.comment-node__header')
    ?? target.querySelector<HTMLElement>('.comments-page__comment-meta')
    ?? target;
  scrollAnchor.style.scrollMarginTop = '0px';
  // Do not inherit the root's smooth scrolling: readiness requires a settled target.
  scrollAnchor.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'instant' });
}

async function syncHashPath() {
  const targetId = location.hash.slice(1) || null;
  const navigation = fragmentLoading.begin(targetId);
  hashNavigationVersion.value += 1;
  hashTargetId.value = targetId;
  mainThreadHashTargetId.value = targetId;

  if (!targetId) {
    hashPathIds.value = new Set();
    navigation.finish();
    return;
  }

  try {
    await positionHashTarget(targetId, navigation);
  } catch (error) {
    commentsLogger.error('Failed to open linked comment', { targetId }, error);
  } finally {
    navigation.finish();
  }
}

async function positionHashTarget(targetId: string, navigation: FragmentLoadingTask) {
  const { isCurrent } = navigation;
  const path = findCommentPath(pageData.comments, targetId)?.map(node => node.id) ?? null;
  const nextHashPathIds = new Set(path);

  if (isCommentItem && pageData.item.id === targetId) {
    nextHashPathIds.add(targetId);
  }

  hashPathIds.value = nextHashPathIds;

  await nextTick();
  // Replies mounted above a fragment can move it after an early scroll.
  await commentTreeRef.value?.whenIdle();
  await waitForLayoutToSettle();
  if (!isCurrent()) {
    return;
  }

  const target = await waitForRenderedHashTarget([targetId], isCurrent);
  // The deepest rendered ancestor stands in for targets that live in a modal.
  const mainThreadTarget = await waitForRenderedHashTarget(path ? [...path].reverse() : [targetId], isCurrent, true);

  if (!isCurrent()) {
    return;
  }
  mainThreadHashTargetId.value = mainThreadTarget?.targetId ?? null;

  if (mainThreadTarget) {
    navigation.startPositioning();
    scrollMainPageTarget(mainThreadTarget.element);
    await waitForAnimationFrame();
    if (isCurrent()) {
      scrollMainPageTarget(mainThreadTarget.element);
    }
    await waitForAnimationFrame();
    return;
  }

  commentsLogger.warn(`Fragment scroll warning: ${target ? 'main-thread-target-not-found' : 'target-not-found'}`, {
    targetId,
    pathLength: path?.length ?? 0,
    readyState: document.readyState,
    isMobile: window.matchMedia('(max-width: 640px)').matches,
    domCommentCount: getExtensionRootHost()?.querySelectorAll('.comment-node').length ?? 0,
    scrollY: Math.round(window.scrollY),
  });
}

onMounted(() => {
  void syncHashPath();
});

useEventListener(window, 'hashchange', () => {
  void syncHashPath();
});
</script>

<template>
  <div class="comments-page">
    <div class="comments-page__container hn-content-card">
      <template v-if="pageData.item.type === 'story'">
        <StoryDetail :item="pageData.item" />
        <PollOptions v-if="pageData.pollOptions.length > 0" :options="pageData.pollOptions" />
      </template>

      <template v-else-if="pageData.item.type === 'comment'">
        <div :id="pageData.item.id" class="comments-page__comment-parent">
          <!-- Thread context header -->
          <OnStoryHeader v-if="pageData.item.storyTitle" :block="true" label="thread" :href="pageData.item.storyLink || ''" :title="pageData.item.storyTitle" />

          <!-- Comment: vote + content -->
          <div class="comments-page__comment-layout">
            <div class="comments-page__comment-content">
              <div class="comments-page__comment-meta">
                <CommentUserMeta
                  :author="pageData.item.author"
                  :author-is-new="pageData.item.authorIsNew"
                  :age-link="pageData.item.ageLink"
                  :age="pageData.item.age"
                  :age-timestamp="pageData.item.ageTimestamp"
                  :is-deleted="pageData.item.isDeleted"
                  :is-dead="pageData.item.isDead"
                  :is-flagged="pageData.item.isFlagged"
                  :original-poster-title="commentItemOriginalPosterTitle"
                />
                <div class="comments-page__comment-meta-actions">
                  <MetaSep class="comments-page__comment-meta-actions-sep" />
                  <template v-if="itemFavoriteHref">
                    <InlineActionLink
                      action="favorite"
                      :favorite-target="pageData.item"
                      class="comments-page__comment-action"
                    />
                    <MetaSep />
                  </template>
                  <template v-if="itemFlagHref">
                    <FlagButton :flag-target="pageData.item" />
                    <MetaSep />
                  </template>
                  <a :href="latestUrl" class="comments-page__comment-action">latest</a>
                  <MetaSep />
                  <FragmentLinkButton :target-id="pageData.item.id" />
                </div>
              </div>
              <div class="comments-page__comment-body">
                <CommentBody
                  :html="pageData.item.bodyHtml || ''"
                  gray-level="c00"
                  :placeholder-kind="pageData.item.placeholderKind"
                />
              </div>
              <CommentActions
                class="comments-page__comment-actions"
                :vote-target="pageData.item"
              />
            </div>
          </div>
        </div>
      </template>

      <div v-if="pageData.replyForm" class="comments-page__form-wrapper">
        <CommentForm :form="pageData.replyForm" />
      </div>
      <div v-else-if="storyReplyState === 'dead'" class="comments-page__thread-state">
        <Badge variant="dead" label="Dead" />
        <span>This thread is dead. You can't post a comment.</span>
      </div>
      <div v-else-if="storyReplyState === 'login'" class="comments-page__login-prompt">
        <a :href="loginUrl">Log in</a> to post a comment.
      </div>
      <div v-else-if="storyReplyState === 'unavailable'" class="comments-page__thread-state">
        Commenting is unavailable on this thread.
      </div>

      <!-- Tree -->
      <div class="comments-page__comments-region">
        <div
          :inert="fragmentLoading.isPending.value && fragmentLoading.isInitialNavigation.value"
          :aria-busy="fragmentLoading.isPending.value"
        >
          <div v-if="totalCommentCount > 0" class="comments-page__comments-header">
            {{ totalCommentCount }} {{ totalCommentCount === 1 ? 'comment' : 'comments' }}
          </div>
          <CommentTree v-if="totalCommentCount > 0" ref="commentTree" :comments="pageData.comments" />
          <div v-else class="comments-page__empty-state">
            No comments yet.
          </div>
        </div>
        <FragmentLoading
          v-if="fragmentLoading.isPending.value"
          :cover="fragmentLoading.isInitialNavigation.value"
          :show-indicator="fragmentLoading.showIndicator.value"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.comments-page {
  padding-bottom: 2rem;

  &__container {
    padding-bottom: 8px;
  }

  &__comments-region {
    position: relative;
  }

  &__comment-parent {
    border-bottom: 1px solid var(--color-border);
    scroll-margin-top: var(--fragment-scroll-offset);
  }

  &__comment-layout {
    display: flex;
    align-items: flex-start;
    gap: 0.4rem;
    padding: 0.75rem 0.75rem 1rem;
  }

  &__comment-content {
    flex: 1;
    min-width: 0;
  }

  &__comment-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    column-gap: 0.35rem;
    row-gap: 0.1rem;
    font-size: var(--hn-meta-font-size);
    line-height: var(--hn-meta-line-height);
    color: var(--color-text-muted);
    margin-bottom: 0.6rem;
  }

  &__comment-action {
    display: inline-flex;
    align-items: center;
    min-block-size: var(--hn-meta-row-height);
    padding-inline: 0.12rem;
    color: inherit;
    font-weight: var(--hn-meta-action-font-weight);
    text-decoration: none;

    &:hover {
      color: var(--color-text);
      text-decoration: underline;
    }
  }

  &__comment-meta-actions {
    display: inline-flex;
    align-items: center;
    min-height: var(--hn-meta-row-height);
    flex-wrap: nowrap;
    column-gap: 0.35rem;
    row-gap: 0.1rem;
    white-space: nowrap;
  }

  &__comment-body {
    font-size: 1rem;
    line-height: 1.55;
    color: var(--color-text);
  }

  &__comment-actions {
    margin-top: 0.4rem;
  }

  &__form-wrapper {
    padding: 0.875rem 0.75rem;
  }

  &__login-prompt {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    color: var(--color-text-muted);
    border-top: 1px solid var(--color-border);

    a {
      color: var(--color-accent);
      text-decoration: none;
      font-weight: 600;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  &__thread-state {
    display: flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    color: var(--color-text-muted);
    border-top: 1px solid var(--color-border);
  }

  &__comments-header {
    padding: 0.6rem 1rem 0rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    text-decoration-line: underline;
    text-decoration-color: var(--color-border-strong);
    text-decoration-thickness: 1.5px;
    text-underline-offset: 4px;
    border-top: 1px solid var(--color-border);
  }

  &__empty-state {
    padding: 0.85rem 1rem 1rem;
    font-size: 0.875rem;
    color: var(--color-text-muted);
    border-top: 1px solid var(--color-border);
  }

  @media (max-width: 640px) {
    &__comment-meta {
      column-gap: 0.55rem;
      row-gap: 0.22rem;
      margin-bottom: 0.7rem;
    }

    &__comment-meta-actions {
      column-gap: 0.55rem;
      row-gap: 0.22rem;
    }

    &__comment-meta-actions-sep {
      display: none;
    }
  }
}

// Deep selector for the comment tree within the container
:deep(.comment-tree) {
  padding: 0.75rem;
}
</style>
