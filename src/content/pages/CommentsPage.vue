<script setup lang="ts">
import { useEventListener } from '@vueuse/core';
import { computed, inject, nextTick, onMounted, provide, ref, shallowRef } from 'vue';
import type { ParsedHeader } from '@/parsers/header';
import type { ParsedItemPage } from '@/parsers/item';
import type { CommentNode as ParsedCommentNode } from '@/parsers/item';
import { createLogger, debugLog } from '@/debug';
import StoryDetail from '@/content/stories/StoryDetail.vue';
import CommentTree from '@/content/comments/CommentTree.vue';
import CommentForm from '@/content/forms/CommentForm.vue';
import CommentBody from '@/content/comments/CommentBody.vue';
import { COMMENT_FRAGMENT_STATE_KEY, type CommentFragmentState } from '@/state/fragment-state';
import Badge from '@/content/ui/primitives/Badge.vue';
import FlagButton from '@/content/ui/composites/FlagButton.vue';
import PollOptions from '@/content/ui/composites/PollOptions.vue';
import OnStoryHeader from '@/content/comments/OnStoryHeader.vue';
import CommentUserMeta from '@/content/ui/composites/CommentUserMeta.vue';
import CommentActions from '@/content/ui/composites/CommentActions.vue';
import FragmentLinkButton from '@/content/ui/helpers/FragmentLinkButton.vue';
import MetaSep from '@/content/ui/primitives/MetaSep.vue';
import { useIsMobile } from '@/state/use-is-mobile';
import { waitForAnimationFrame, waitForLayoutToSettle } from '@/content/utils/wait';

const commentsLogger = createLogger('comments');

const pageData = inject<ParsedItemPage>('pageData');
const header = inject<ParsedHeader>('header');
const commentItemDomId = computed(() => {
  if (!pageData || pageData.item.type !== 'comment') {
    return null;
  }

  return pageData.item.id;
});

const commentIsFavorited = computed(() => pageData?.item.favoriteUrl?.includes('un=t') ?? false);
const latestUrl = computed(() => pageData ? `latest?id=${encodeURIComponent(pageData.item.id)}` : null);

const totalCommentCount = computed(() => {
  if (!pageData) return 0;
  return pageData.comments.reduce((sum, c) => sum + 1 + c.descendantCount, 0);
});

const storyReplyState = computed<'dead' | 'login' | 'unavailable' | null>(() => {
  if (!pageData || pageData.item.type !== 'story' || pageData.replyForm) {
    return null;
  }

  if (pageData.item.isDead) {
    return 'dead';
  }

  if (!header?.user) {
    return 'login';
  }

  return 'unavailable';
});

const isMobileLayout = useIsMobile();
const hashPathIds = shallowRef(new Set<string>());
const hashTargetId = ref<string | null>(null);
const mainThreadHashTargetId = ref<string | null>(null);

const fragmentState: CommentFragmentState = {
  hashPathIds,
  hashTargetId,
  mainThreadHashTargetId,
};

provide(COMMENT_FRAGMENT_STATE_KEY, fragmentState);

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

type HashTargetMatch = {
  element: HTMLElement;
  targetId: string;
};

async function waitForRenderedHashTarget(
  targetIds: string[],
  attempts = 36,
  excludeModal = false,
): Promise<HashTargetMatch | null> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
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
  scrollAnchor.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'auto' });
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
  hashTargetId.value = targetId;
  mainThreadHashTargetId.value = targetId;

  if (!pageData || !targetId) {
    hashPathIds.value = new Set();
    mainThreadHashTargetId.value = null;
    return;
  }

  const path = findCommentPath(pageData.comments, targetId);
  const nextHashPathIds = new Set(path ?? []);

  if (pageData.item.type === 'comment' && pageData.item.id === targetId) {
    nextHashPathIds.add(targetId);
  }

  hashPathIds.value = nextHashPathIds;

  await nextTick();
  await waitForLayoutToSettle();

  const target = await waitForRenderedHashTarget([targetId]);
  const mainThreadTarget = await waitForRenderedHashTarget(
    getMainThreadHashTargetCandidates(targetId, path),
    36,
    true,
  );

  mainThreadHashTargetId.value = mainThreadTarget?.targetId ?? null;

  if (mainThreadTarget) {
    scrollMainPageTarget(mainThreadTarget.element);
    await waitForAnimationFrame();
    scrollMainPageTarget(mainThreadTarget.element);
    return;
  }

  if (!target) {
    logFragmentWarning('target-not-found', {
      targetId,
      pathLength: path?.length ?? 0,
      readyState: document.readyState,
      isMobile: isMobileLayout.value,
      domCommentCount: getModernRoot()?.querySelectorAll('.comment-node').length ?? 0,
      scrollY: Math.round(window.scrollY),
    });
    return;
  }

  logFragmentWarning('main-thread-target-not-found', {
    targetId,
    pathLength: path?.length ?? 0,
    readyState: document.readyState,
    isMobile: isMobileLayout.value,
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
  <div class="comments-page" v-if="pageData">
    <div class="comments-page__container hn-content-card">
      <template v-if="pageData.item.type === 'story'">
        <StoryDetail :item="pageData.item" />
        <PollOptions v-if="pageData.pollOptions.length > 0" :options="pageData.pollOptions" />
      </template>
      
      <template v-else-if="pageData.item.type === 'comment'">
        <div class="comments-page__comment-parent" :id="commentItemDomId || undefined">

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
                />
                <div class="comments-page__comment-meta-actions">
                  <MetaSep class="comments-page__comment-meta-actions-sep" />
                  <template v-if="pageData.item.favoriteUrl">
                    <a :href="pageData.item.favoriteUrl" class="comments-page__comment-action">{{ commentIsFavorited ? 'un-favorite' : 'favorite' }}</a>
                    <MetaSep v-if="pageData.item.flagUrl || latestUrl" />
                  </template>
                  <template v-if="pageData.item.flagUrl">
                    <FlagButton :href="pageData.item.flagUrl" :flag-target="pageData.item" />
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
                :item-id="pageData.item.id"
                :vote-up="pageData.item.voteUp"
                :vote-un="pageData.item.voteUn"
                :vote-down="pageData.item.voteDown"
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
        <a href="login">Log in</a> to post a comment.
      </div>
      <div v-else-if="storyReplyState === 'unavailable'" class="comments-page__thread-state">
        Commenting is unavailable on this thread.
      </div>

      <!-- Tree -->
      <div v-if="totalCommentCount > 0" class="comments-page__comments-header">
        {{ totalCommentCount }} {{ totalCommentCount === 1 ? 'comment' : 'comments' }}
      </div>
      <CommentTree v-if="totalCommentCount > 0" :comments="pageData.comments" />
      <div v-else class="comments-page__empty-state">No comments yet.</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.comments-page {
  padding-bottom: 2rem;

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
    font-size: 0.82rem;
    color: var(--color-text-muted);
    margin-bottom: 0.6rem;
  }

  &__comment-action {
    color: inherit;
    font-weight: 600;
    text-decoration: none;

    &:hover {
      color: var(--color-text);
      text-decoration: underline;
    }
  }

  &__comment-meta-actions {
    display: inline-flex;
    align-items: center;
    flex-wrap: nowrap;
    column-gap: 0.35rem;
    row-gap: 0.1rem;
    white-space: nowrap;
  }

  &__comment-body {
    font-size: 0.95rem;
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
      font-size: 0.96rem;
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
  margin-top: 0;
  padding: 0.75rem;
  background: var(--color-surface);
}
</style>
