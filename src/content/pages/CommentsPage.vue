<script setup lang="ts">
import type { FragmentLoadingTask } from '@/content/composables/comment-fragment-loading';
import type { CommentNode as ParsedCommentNode, ParsedItemPage } from '@/parsers/item';
import type { CommentFragmentState } from '@/state/fragment-state';
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
import { waitForAnimationFrame, waitForLayoutToSettle } from '@/content/utils/wait';
import { createLogger, debugLog } from '@/debug';
import { getToggleActionHref } from '@/parsers/shared/actions';
import { COMMENT_FRAGMENT_STATE_KEY } from '@/state/fragment-state';

const commentsLogger = createLogger('comments');

const pageData = inject<ParsedItemPage>('pageData');
const commentTreeRef = useTemplateRef('commentTree');
const fragmentLoading = provideCommentFragmentLoading();
const currentUser = useCurrentUser();
const commentItemDomId = computed(() => {
  if (!pageData || pageData.item.type !== 'comment') {
    return null;
  }

  return pageData.item.id;
});

const latestUrl = computed(() => pageData ? `latest?id=${encodeURIComponent(pageData.item.id)}` : null);
const itemFavoriteHref = computed(() => pageData ? getToggleActionHref(pageData.item.favoriteAction) : null);
const itemFlagHref = computed(() => pageData ? getToggleActionHref(pageData.item.flagAction) : null);
const loginUrl = computed(() => currentUser.loginUrl ?? 'login');
const commentItemOriginalPosterTitle = computed(() => {
  if (!pageData || pageData.item.type !== 'comment') {
    return null;
  }

  return getOriginalPosterTitle({
    author: pageData.item.author,
    threadAuthor: pageData.item.author,
  });
});

const totalCommentCount = computed(() => {
  if (!pageData) {
    return 0;
  }
  return pageData.comments.reduce((sum, c) => sum + 1 + c.descendantCount, 0);
});

const storyReplyState = computed<'dead' | 'login' | 'unavailable' | null>(() => {
  if (!pageData || pageData.item.type !== 'story' || pageData.replyForm) {
    return null;
  }

  if (pageData.item.isDead) {
    return 'dead';
  }

  if (!currentUser.isLoggedIn) {
    return 'login';
  }

  return 'unavailable';
});

const hashPathIds = shallowRef(new Set<string>());
const hashTargetId = ref<string | null>(null);
const mainThreadHashTargetId = ref<string | null>(null);
const hashNavigationVersion = ref(0);

const fragmentState: CommentFragmentState = {
  hashPathIds,
  hashTargetId,
  mainThreadHashTargetId,
  hashNavigationVersion,
};

provide(COMMENT_FRAGMENT_STATE_KEY, fragmentState);
provide(COMMENT_THREAD_STORY_AUTHOR_KEY, pageData?.item.type === 'story' ? pageData.item.author : null);
provide(COMMENT_THREAD_ROOT_AUTHOR_KEY, pageData?.item.type === 'comment' ? pageData.item.author : null);

function getModernRoot(): HTMLElement | null {
  return document.getElementById('fancy-hn-root');
}

function findRenderedHashTarget(targetId: string, excludeModal = false): HTMLElement | null {
  const selector = `#${CSS.escape(targetId)}`;

  const matches = getModernRoot()?.querySelectorAll<HTMLElement>(selector) ?? [];
  for (const match of matches) {
    if (excludeModal && match.closest('.sub-thread-modal')) {
      continue;
    }

    return match;
  }

  return null;
}

function getMainPageScrollAnchor(target: HTMLElement): HTMLElement {
  return target.querySelector<HTMLElement>('.comment-node__header')
    ?? target.querySelector<HTMLElement>('.comments-page__comment-meta')
    ?? target;
}

interface HashTargetMatch {
  element: HTMLElement;
  targetId: string;
}

async function waitForRenderedHashTarget(
  targetIds: string[],
  isCurrent: () => boolean,
  attempts = 36,
  excludeModal = false,
): Promise<HashTargetMatch | null> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (!isCurrent()) return null;
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

function getMainThreadHashTargetCandidates(targetId: string, path: string[] | null): string[] {
  const candidates = [targetId, ...(path ? [...path].reverse() : [])];

  return [...new Set(candidates)];
}

function scrollMainPageTarget(target: HTMLElement) {
  const scrollAnchor = getMainPageScrollAnchor(target);
  scrollAnchor.style.scrollMarginTop = '0px';
  // Do not inherit the root's smooth scrolling: readiness requires a settled target.
  scrollAnchor.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'instant' });
}

function logFragmentWarning(
  reason: string,
  details: Record<string, unknown>,
) {
  commentsLogger.warn(`Fragment scroll warning: ${reason}`, details);
  debugLog(`fragment:${reason}`, details);
}

function findCommentPath(
  nodes: ParsedCommentNode[],
  targetId: string,
): string[] | null {
  for (const node of nodes) {
    if (node.id === targetId) {
      return [node.id];
    }

    const childPath = findCommentPath(node.children, targetId);
    if (childPath) {
      return [node.id, ...childPath];
    }
  }

  return null;
}

async function syncHashPath() {
  const targetId = location.hash.slice(1) || null;
  const navigation = fragmentLoading.begin(targetId);
  hashNavigationVersion.value += 1;
  hashTargetId.value = targetId;
  mainThreadHashTargetId.value = targetId;

  if (!pageData || !targetId) {
    hashPathIds.value = new Set();
    mainThreadHashTargetId.value = null;
    navigation.finish();
    return;
  }

  try {
    await positionHashTarget(pageData, targetId, navigation);
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    commentsLogger.error('Failed to open linked comment', { targetId, error: error.message });
  } finally {
    navigation.finish();
  }
}

async function positionHashTarget(page: ParsedItemPage, targetId: string, navigation: FragmentLoadingTask) {
  const { isCurrent } = navigation;
  const path = findCommentPath(page.comments, targetId);
  const nextHashPathIds = new Set(path ?? []);

  if (page.item.type === 'comment' && page.item.id === targetId) {
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
  const mainThreadTarget = await waitForRenderedHashTarget(
    getMainThreadHashTargetCandidates(targetId, path),
    isCurrent,
    36,
    true,
  );

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

  if (!target) {
    logFragmentWarning('target-not-found', {
      targetId,
      pathLength: path?.length ?? 0,
      readyState: document.readyState,
      isMobile: window.matchMedia('(max-width: 640px)').matches,
      domCommentCount: getModernRoot()?.querySelectorAll('.comment-node').length ?? 0,
      scrollY: Math.round(window.scrollY),
    });
    return;
  }

  logFragmentWarning('main-thread-target-not-found', {
    targetId,
    pathLength: path?.length ?? 0,
    readyState: document.readyState,
    isMobile: window.matchMedia('(max-width: 640px)').matches,
    domCommentCount: getModernRoot()?.querySelectorAll('.comment-node').length ?? 0,
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
  <div v-if="pageData" class="comments-page">
    <div class="comments-page__container hn-content-card">
      <template v-if="pageData.item.type === 'story'">
        <StoryDetail :item="pageData.item" />
        <PollOptions v-if="pageData.pollOptions.length > 0" :options="pageData.pollOptions" />
      </template>

      <template v-else-if="pageData.item.type === 'comment'">
        <div :id="commentItemDomId || undefined" class="comments-page__comment-parent">
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
                      :href="itemFavoriteHref"
                      action="favorite"
                      :favorite-target="pageData.item"
                      class="comments-page__comment-action"
                    />
                    <MetaSep v-if="itemFlagHref || latestUrl" />
                  </template>
                  <template v-if="itemFlagHref">
                    <FlagButton :href="itemFlagHref" :flag-target="pageData.item" />
                    <MetaSep v-if="latestUrl" />
                  </template>
                  <template v-if="latestUrl">
                    <a :href="latestUrl" class="comments-page__comment-action">latest</a>
                    <MetaSep />
                  </template>
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

  &__comment-vote {
    padding-top: 0.15rem;
    flex-shrink: 0;
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
