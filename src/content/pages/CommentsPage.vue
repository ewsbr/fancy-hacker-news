<script setup lang="ts">
import { computed, inject, nextTick, onMounted, onUnmounted, provide, ref } from 'vue';
import type { ParsedItemPage } from '@/parsers/item';
import type { CommentNode as ParsedCommentNode } from '@/parsers/item';
import { createLogger, debugLog } from '@/debug';
import StoryDetail from '@/content/stories/StoryDetail.vue';
import CommentTree from '@/content/comments/CommentTree.vue';
import CommentForm from '@/content/forms/CommentForm.vue';
import CommentBody from '@/content/comments/CommentBody.vue';
import { COMMENT_FRAGMENT_STATE_KEY, type CommentFragmentState } from '@/state/fragmentState';
import VoteButton from '@/content/shared/VoteButton.vue';
import Badge from '@/content/shared/Badge.vue';
import FlagButton from '@/content/shared/FlagButton.vue';
import PollOptions from '@/content/shared/PollOptions.vue';
import OnStoryHeader from '@/content/comments/OnStoryHeader.vue';
import AuthorByline from '@/content/shared/AuthorByline.vue';

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

function waitForAnimationFrame() {
  return new Promise<void>(resolve => {
    requestAnimationFrame(() => resolve());
  });
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

  const target = await waitForRenderedHashTarget([targetId]);
  const mainThreadTarget = await waitForRenderedHashTarget(
    getMainThreadHashTargetCandidates(targetId, path),
    36,
    true,
  );

  mainThreadHashTargetId.value = mainThreadTarget?.targetId ?? null;

  if (mainThreadTarget) {
    scrollMainPageTarget(mainThreadTarget.element);
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
                <template v-if="pageData.item.isDeleted">
                  <span class="comments-page__comment-deleted">[deleted]</span>
                  <span class="comments-page__comment-sep">&middot;</span>
                  <a
                    :href="pageData.item.ageLink"
                    :title="pageData.item.ageTimestamp"
                    class="comments-page__comment-age"
                  >
                    {{ pageData.item.age }}
                  </a>
                </template>
                <template v-else>
                  <AuthorByline
                    :author="pageData.item.author"
                    :author-is-new="pageData.item.authorIsNew"
                    :age-link="pageData.item.ageLink"
                    :age="pageData.item.age"
                    :age-timestamp="pageData.item.ageTimestamp"
                  />
                  <Badge v-if="pageData.item.isDead" variant="dead" label="Dead" />
                  <Badge v-if="pageData.item.isFlagged" variant="flagged" label="Flagged" />
                </template>
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
                <CommentBody
                  :html="pageData.item.bodyHtml || ''"
                  gray-level="c00"
                  :placeholder-kind="pageData.item.placeholderKind"
                />
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

  &__comment-deleted,
  &__comment-age {
    color: var(--color-text-muted);
  }

  &__comment-deleted {
    font-style: italic;
  }

  &__comment-age {
    text-decoration: none;

    &:hover {
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
