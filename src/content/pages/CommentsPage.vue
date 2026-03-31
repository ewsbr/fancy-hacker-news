<script setup lang="ts">
import { computed, inject, nextTick, onMounted, onUnmounted, provide, ref } from 'vue';
import type { ParsedItemPage } from '@/parsers/item';
import type { CommentNode as ParsedCommentNode } from '@/parsers/item';
import StoryDetail from '@/content/stories/StoryDetail.vue';
import CommentTree from '@/content/comments/CommentTree.vue';
import CommentForm from '@/content/comments/CommentForm.vue';
import CommentBody from '@/content/comments/CommentBody.vue';
import VoteButton from '@/content/shared/VoteButton.vue';
import Badge from '@/content/shared/Badge.vue';
import FlagButton from '@/content/shared/FlagButton.vue';
import PollOptions from '@/content/shared/PollOptions.vue';

const COMMENT_HASH_PATH_IDS_KEY = 'comment-hash-path-ids';
const HASH_TARGET_ID_KEY = 'hash-target-id';

const pageData = inject<ParsedItemPage>('pageData');
const commentItemDomId = computed(() => {
  if (!pageData || pageData.item.type !== 'comment') {
    return null;
  }

  return pageData.item.id;
});

const commentIsFavorited = computed(() => pageData?.item.favoriteUrl?.includes('un=t') ?? false);

const hashPathIds = ref<Set<string>>(new Set());
const hashTargetId = ref<string | null>(null);

provide(COMMENT_HASH_PATH_IDS_KEY, hashPathIds);
provide(HASH_TARGET_ID_KEY, hashTargetId);

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

  if (pageData.item.type === 'comment' && pageData.item.id === targetId) {
    hashPathIds.value = new Set([targetId]);
    await nextTick();
    document.getElementById(targetId)?.scrollIntoView();
    return;
  }

  const path = findCommentPath(pageData.comments, targetId);
  hashPathIds.value = new Set(path ?? []);

  await nextTick();

  // Defer scroll to next macrotask — the browser may perform its own native
  // hash-scroll when elements matching the URL fragment appear in the DOM.
  // By yielding to a setTimeout(0), we ensure our scroll runs AFTER the
  // browser's native behavior.
  await new Promise(resolve => setTimeout(resolve, 0));

  // Find the right element to scroll to. If the target ended up inside a modal
  // (mobile deep thread), walk the path backward to find the last ancestor on
  // the main page — the modal handles internal scrolling.
  const targetEl = document.getElementById(targetId);
  if (targetEl && !targetEl.closest('.sub-thread-modal')) {
    targetEl.scrollIntoView({ block: 'start' });
  } else if (path) {
    for (let i = path.length - 1; i >= 0; i--) {
      const candidates = document.querySelectorAll(`#${CSS.escape(path[i])}`);
      for (const el of candidates) {
        if (!el.closest('.sub-thread-modal')) {
          // Scroll to the "View N replies" button if present, since the target
          // is behind the modal and the user needs to tap this button.
          // Use block:'center' for the button (it lacks scroll-margin-top so
          // 'start' would place it behind the sticky header).
          const btn = el.querySelector('.comment-node__thread-btn');
          if (btn) {
            (btn as HTMLElement).scrollIntoView({ block: 'center' });
          } else {
            (el as HTMLElement).scrollIntoView({ block: 'start' });
          }
          return;
        }
      }
    }
  }
}

syncHashPath();

onMounted(() => {
  window.addEventListener('hashchange', syncHashPath);
});

onUnmounted(() => {
  window.removeEventListener('hashchange', syncHashPath);
});
</script>

<template>
  <div class="comments-page" v-if="pageData">
    <div class="comments-page__container">
      <template v-if="pageData.item.type === 'story'">
        <StoryDetail :item="pageData.item" />
        <PollOptions v-if="pageData.pollOptions.length > 0" :options="pageData.pollOptions" />
      </template>
      
      <template v-else-if="pageData.item.type === 'comment'">
        <div class="comments-page__comment-parent" :id="commentItemDomId || undefined">

          <!-- Thread context header -->
          <div class="comments-page__thread" v-if="pageData.item.storyTitle">
            <span class="comments-page__thread-label">thread</span>
            <a :href="pageData.item.storyLink || ''" class="comments-page__thread-title">
              {{ pageData.item.storyTitle }}
            </a>
          </div>

          <!-- Comment: vote + content -->
          <div class="comments-page__comment-layout">
            <div class="comments-page__comment-vote">
              <VoteButton :href="pageData.item.voteUp" />
            </div>
            <div class="comments-page__comment-content">
              <div class="comments-page__comment-meta">
                <a :href="`user?id=${pageData.item.author}`" class="comments-page__comment-author">{{ pageData.item.author }}</a>
                <Badge v-if="pageData.item.authorIsNew" variant="new" label="New" title="New user" />
                <Badge v-if="pageData.item.isDead" variant="dead" label="Dead" />
                <Badge v-if="pageData.item.isFlagged" variant="flagged" label="Flagged" />
                <span class="comments-page__comment-sep">&middot;</span>
                <a :href="pageData.item.ageLink" class="comments-page__comment-age" :title="pageData.item.ageTimestamp">{{ pageData.item.age }}</a>
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

      <!-- Tree -->
      <CommentTree :comments="pageData.comments" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.comments-page {
  padding-bottom: 2rem;

  &__container {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-top: 3px solid var(--color-accent);
    border-radius: 4px;
    box-shadow: var(--shadow-elevation);
    overflow: hidden;
  }

  &__comment-parent {
    border-bottom: 1px solid var(--color-border);
    scroll-margin-top: 50px;
  }

  &__thread {
    padding: 0.6rem 0.75rem 0.55rem;
    background: color-mix(in srgb, var(--color-surface) 96%, var(--color-accent) 4%);
    border-bottom: 1px solid var(--color-border);
  }

  &__thread-label {
    display: block;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--color-text-muted);
    margin-bottom: 0.2rem;
  }

  &__thread-title {
    display: block;
    font-family: var(--font-title);
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--color-text);
    text-decoration: none;
    line-height: 1.3;

    &:hover {
      color: var(--color-accent);
    }
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

  &__comment-author {
    font-weight: 700;
    color: var(--color-text);
    text-decoration: none;

    &:hover {
      color: var(--color-accent);
      text-decoration: underline;
    }
  }

  &__comment-sep {
    color: var(--color-border);
    font-weight: 900;
    font-size: 1.1rem;
    user-select: none;
  }

  &__comment-age {
    color: inherit;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
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
}

// Deep selector for the comment tree within the container
:deep(.comment-tree) {
  margin-top: 0;
  padding: 0.75rem;
  background: var(--color-surface);
}
</style>
