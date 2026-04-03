<script setup lang="ts">
import { computed, inject, nextTick, onMounted, onUnmounted, provide, ref } from 'vue';
import type { ParsedItemPage } from '@/parsers/item';
import type { CommentNode as ParsedCommentNode } from '@/parsers/item';
import { createLogger, debugLog, isDebugMode } from '@/debug';
import StoryDetail from '@/content/stories/StoryDetail.vue';
import CommentTree from '@/content/comments/CommentTree.vue';
import CommentForm from '@/content/comments/CommentForm.vue';
import CommentBody from '@/content/comments/CommentBody.vue';
import VoteButton from '@/content/shared/VoteButton.vue';
import Badge from '@/content/shared/Badge.vue';
import FlagButton from '@/content/shared/FlagButton.vue';
import PollOptions from '@/content/shared/PollOptions.vue';
import OnStoryHeader from '@/content/shared/OnStoryHeader.vue';
import AuthorByline from '@/content/shared/AuthorByline.vue';

const COMMENT_HASH_PATH_IDS_KEY = 'comment-hash-path-ids';
const HASH_TARGET_ID_KEY = 'hash-target-id';
const commentsLogger = createLogger('comments');

const pageData = inject<ParsedItemPage>('pageData');
const commentItemDomId = computed(() => {
  if (!pageData || pageData.item.type !== 'comment') {
    return null;
  }

  return pageData.item.id;
});

const commentIsFavorited = computed(() => pageData?.item.favoriteUrl?.includes('un=t') ?? false);

const totalCommentCount = computed(() => {
  if (!pageData) return 0;
  return pageData.comments.reduce((sum, c) => sum + 1 + c.descendantCount, 0);
});

const hashPathIds = ref<Set<string>>(new Set());
const hashTargetId = ref<string | null>(null);
const FRAGMENT_SCROLL_TOLERANCE = 24;
const FRAGMENT_SCROLL_SETTLE_ATTEMPTS = 8;

provide(COMMENT_HASH_PATH_IDS_KEY, hashPathIds);
provide(HASH_TARGET_ID_KEY, hashTargetId);

function getModernRoot(): HTMLElement | null {
  return document.getElementById('refined-hn-root');
}

function getScrollContainer(): HTMLElement | null {
  return getModernRoot();
}

function getStickyHeaderOffset(): number {
  const header = getModernRoot()?.querySelector<HTMLElement>('.site-header');
  return header ? header.getBoundingClientRect().height + 8 : 58;
}

function waitForAnimationFrame() {
  return new Promise<void>(resolve => {
    requestAnimationFrame(() => resolve());
  });
}

function waitForTimeout(ms: number) {
  return new Promise<void>(resolve => {
    window.setTimeout(resolve, ms);
  });
}

function waitForPageLoad() {
  if (document.readyState === 'complete') {
    return Promise.resolve();
  }

  return new Promise<void>(resolve => {
    const onLoad = () => {
      window.removeEventListener('load', onLoad);
      resolve();
    };

    window.addEventListener('load', onLoad);
  });
}

async function waitForRenderedHashTarget(targetId: string, attempts = 36): Promise<HTMLElement | null> {
  const selector = `#${CSS.escape(targetId)}`;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const target = getModernRoot()?.querySelector<HTMLElement>(selector) ?? null;
    if (target) {
      return target;
    }

    await waitForAnimationFrame();
  }

  return null;
}

function scrollMainPageTarget(target: HTMLElement) {
  const scrollContainer = getScrollContainer();
  const offset = getStickyHeaderOffset();
  target.style.scrollMarginTop = `${Math.ceil(offset)}px`;

  if (!scrollContainer) {
    target.scrollIntoView({ block: 'start', inline: 'nearest', behavior: 'auto' });
    return;
  }

  const containerRect = scrollContainer.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const desiredScrollTop = scrollContainer.scrollTop + (targetRect.top - containerRect.top) - offset;
  const maxScrollTop = Math.max(0, scrollContainer.scrollHeight - scrollContainer.clientHeight);

  scrollContainer.scrollTo({
    top: Math.min(Math.max(0, desiredScrollTop), maxScrollTop),
    left: 0,
    behavior: 'auto',
  });
}

function logFragmentWarning(
  reason: string,
  details: Record<string, unknown>,
) {
  commentsLogger.warn(`Fragment scroll warning: ${reason}`, details);
  debugLog(`fragment:${reason}`, details);
}

function getMainPageScrollMetrics(target: HTMLElement) {
  const scrollContainer = getScrollContainer();
  const headerOffset = getStickyHeaderOffset();
  const containerTop = Math.round(scrollContainer?.getBoundingClientRect().top ?? 0);
  const actualTop = Math.round(target.getBoundingClientRect().top);
  const expectedTop = Math.round(containerTop + headerOffset);
  const delta = actualTop - expectedTop;
  const rootScrollTop = Math.round(scrollContainer?.scrollTop ?? 0);
  const rootMaxScrollTop = Math.max(
    0,
    (scrollContainer?.scrollHeight ?? 0) - (scrollContainer?.clientHeight ?? 0),
  );
  const isClampedAtTop = delta > FRAGMENT_SCROLL_TOLERANCE && rootScrollTop <= 1;
  const isClampedAtBottom = delta < -FRAGMENT_SCROLL_TOLERANCE && rootScrollTop >= rootMaxScrollTop - 1;

  return {
    actualTop,
    expectedTop,
    delta,
    headerOffset,
    rootScrollTop,
    rootMaxScrollTop,
    isClampedAtTop,
    isClampedAtBottom,
  };
}

async function verifyMainPageScroll(targetId: string, pathLength: number) {
  const selector = `#${CSS.escape(targetId)}`;
  let lastMetrics: ReturnType<typeof getMainPageScrollMetrics> | null = null;

  for (let attempt = 0; attempt < FRAGMENT_SCROLL_SETTLE_ATTEMPTS; attempt += 1) {
    const target = getModernRoot()?.querySelector<HTMLElement>(selector) ?? null;
    if (!target) {
      logFragmentWarning('target-missing-after-scroll', {
        targetId,
        pathLength,
        readyState: document.readyState,
        isMobile: window.matchMedia('(max-width: 640px)').matches,
        domCommentCount: getModernRoot()?.querySelectorAll('.comment-node').length ?? 0,
        scrollY: Math.round(window.scrollY),
        attempt,
      });
      return;
    }

    scrollMainPageTarget(target);

    await waitForAnimationFrame();
    await waitForAnimationFrame();
    await waitForTimeout(80);

    lastMetrics = getMainPageScrollMetrics(target);

    if (lastMetrics.isClampedAtTop || lastMetrics.isClampedAtBottom) {
      if (isDebugMode()) {
        debugLog('fragment:scroll-clamped', {
          targetId,
          pathLength,
          attempt,
          ...lastMetrics,
          clampedAt: lastMetrics.isClampedAtTop ? 'top' : 'bottom',
        });
      }
      return;
    }

    if (Math.abs(lastMetrics.delta) <= FRAGMENT_SCROLL_TOLERANCE) {
      if (isDebugMode()) {
        debugLog('fragment:scroll-success', {
          targetId,
          pathLength,
          attempt,
          scrollY: Math.round(window.scrollY),
          ...lastMetrics,
        });
      }
      return;
    }
  }

  if (lastMetrics && Math.abs(lastMetrics.delta) > FRAGMENT_SCROLL_TOLERANCE) {
    logFragmentWarning('scroll-offset-mismatch', {
      targetId,
      pathLength,
      readyState: document.readyState,
      isMobile: window.matchMedia('(max-width: 640px)').matches,
      attempts: FRAGMENT_SCROLL_SETTLE_ATTEMPTS,
      scrollY: Math.round(window.scrollY),
      ...lastMetrics,
    });
  }
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

  if (!pageData || !targetId) {
    hashPathIds.value = new Set();
    return;
  }

  const path = findCommentPath(pageData.comments, targetId);
  const nextHashPathIds = new Set(path ?? []);

  if (pageData.item.type === 'comment' && pageData.item.id === targetId) {
    nextHashPathIds.add(targetId);
  }

  hashPathIds.value = nextHashPathIds;

  await waitForPageLoad();
  await nextTick();
  await waitForAnimationFrame();
  await waitForAnimationFrame();

  const targetEl = await waitForRenderedHashTarget(targetId);
  if (targetEl?.closest('.sub-thread-modal')) {
    return;
  }

  if (targetEl) {
    scrollMainPageTarget(targetEl);
    await verifyMainPageScroll(targetId, path?.length ?? 0);
  } else {
    logFragmentWarning('target-not-found', {
      targetId,
      pathLength: path?.length ?? 0,
      readyState: document.readyState,
      isMobile: window.matchMedia('(max-width: 640px)').matches,
      domCommentCount: getModernRoot()?.querySelectorAll('.comment-node').length ?? 0,
      scrollY: Math.round(window.scrollY),
    });
  }
}

onMounted(() => {
  void syncHashPath();
  window.addEventListener('hashchange', syncHashPath);
});

onUnmounted(() => {
  window.removeEventListener('hashchange', syncHashPath);
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
            <div class="comments-page__comment-vote">
              <VoteButton :href="pageData.item.voteUp" />
            </div>
            <div class="comments-page__comment-content">
              <div class="comments-page__comment-meta">
                <AuthorByline
                  :author="pageData.item.author"
                  :author-is-new="pageData.item.authorIsNew"
                  :age-link="pageData.item.ageLink"
                  :age="pageData.item.age"
                  :age-timestamp="pageData.item.ageTimestamp"
                />
                <Badge v-if="pageData.item.isDead" variant="dead" label="Dead" />
                <Badge v-if="pageData.item.isFlagged" variant="flagged" label="Flagged" />
                <template v-if="pageData.item.favoriteUrl">
                  <span class="comments-page__comment-sep">&middot;</span>
                  <a :href="pageData.item.favoriteUrl" class="comments-page__comment-action">{{ commentIsFavorited ? 'un-favorite' : 'favorite' }}</a>
                </template>
                <template v-if="pageData.item.flagUrl">
                  <span class="comments-page__comment-sep">&middot;</span>
                  <FlagButton :href="pageData.item.flagUrl" />
                </template>
              </div>
              <div class="comments-page__comment-body">
                <CommentBody :html="pageData.item.bodyHtml || ''" gray-level="c00" />
              </div>
            </div>
          </div>

        </div>
      </template>

      <div v-if="pageData.replyForm" class="comments-page__form-wrapper">
        <CommentForm :form="pageData.replyForm" />
      </div>
      <div v-else-if="pageData.item.type === 'story'" class="comments-page__login-prompt">
        <a href="login">Log in</a> to post a comment.
      </div>

      <!-- Tree -->
      <div v-if="totalCommentCount > 0" class="comments-page__comments-header">
        {{ totalCommentCount }} {{ totalCommentCount === 1 ? 'comment' : 'comments' }}
      </div>
      <CommentTree :comments="pageData.comments" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.comments-page {
  padding-bottom: 2rem;

  &__comment-parent {
    border-bottom: 1px solid var(--color-border);
    scroll-margin-top: 50px;
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

  &__comment-sep {
    color: var(--color-border);
    font-weight: 900;
    font-size: 1.1rem;
    user-select: none;
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

  &__comment-body {
    font-size: 0.95rem;
    line-height: 1.55;
    color: var(--color-text);
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

  &__comments-header {
    padding: 0.6rem 1rem 0rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    border-top: 1px solid var(--color-border);
  }
}

// Deep selector for the comment tree within the container
:deep(.comment-tree) {
  margin-top: 0;
  padding: 0.75rem;
  background: var(--color-surface);
}
</style>
