<script setup lang="ts">
import { computed, inject, ref, watch, type Ref } from 'vue';
import type { CommentNode as CommentNodeType } from '@/parsers/item';
import SubThreadModal from './SubThreadModal.vue';
import CommentBody from './CommentBody.vue';
import { MessageSquare } from 'lucide-vue-next';

const MOBILE_MODAL_DEPTH = 4;
const COMMENT_HASH_PATH_IDS_KEY = 'comment-hash-path-ids';
const HASH_TARGET_ID_KEY = 'hash-target-id';
const MAIN_THREAD_HASH_TARGET_ID_KEY = 'main-thread-hash-target-id';
const HEAVY_DOWNVOTE = new Set(['cce', 'cdd']);
const SUBTREE_PROGRESSIVE_THRESHOLD = 160;
const INITIAL_CHILD_BUDGET = 120;
const FRAME_CHILD_BUDGET = 240;
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
const hashPathIds = inject<Ref<Set<string>>>(COMMENT_HASH_PATH_IDS_KEY, ref(new Set()));
const hashTargetId = inject<Ref<string | null>>(HASH_TARGET_ID_KEY, ref(null));
const mainThreadHashTargetId = inject<Ref<string | null>>(MAIN_THREAD_HASH_TARGET_ID_KEY, ref(null));

const userCollapsed = ref(
  props.node.isCollapsed || (props.node.grayLevel !== null && HEAVY_DOWNVOTE.has(props.node.grayLevel)),
);
const isModalOpen = ref(false);

const currentDepth = props.depth ?? 0;
const childrenInModal = isMobileLayout && !props.inModal && currentDepth >= MOBILE_MODAL_DEPTH;
const directReplyCount = props.node.children.length;
const totalReplyCount = props.node.descendantCount;
const nestedReplyCount = Math.max(0, totalReplyCount - directReplyCount);
const downvoteOpacity = props.node.grayLevel ? DOWNVOTE_LABELS[props.node.grayLevel] || null : null;

const isHashTarget = computed(() => hashTargetId.value === props.node.id);
const isMainThreadHashTarget = computed(() => mainThreadHashTargetId.value === props.node.id);
const isHighlightedForHash = computed(() => (props.inModal ? isHashTarget.value : isMainThreadHashTarget.value));
const isInHashPath = computed(() => props.node.expandForHash || hashPathIds.value.has(props.node.id));
const isForcedExpanded = computed(() => isInHashPath.value && !isHashTarget.value);
const isCollapsed = computed(() => !isForcedExpanded.value && userCollapsed.value);
const isUnvoted = computed(() => !!props.node.voteUn);
const voteHref = computed(() => props.node.voteUn || props.node.voteUp || undefined);
const hasVoteActions = computed(() => !!(voteHref.value || props.node.voteDown));
const hasReplyAction = computed(() => !!props.node.replyLink);
const hasEditAction = computed(() => !!props.node.editUrl);
const hasDeleteAction = computed(() => !!props.node.deleteUrl);
const hasHeaderNav = !!(
  props.node.navLinks.root
  || props.node.navLinks.parent
  || props.node.navLinks.prev
  || props.node.navLinks.next
  || props.node.navLinks.context
);
const flagLabel = computed(() => (props.node.flagUrl?.includes('un=t') ? 'unflag' : 'flag'));
const shouldProgressivelyRenderChildren = !props.inModal && props.node.descendantCount > SUBTREE_PROGRESSIVE_THRESHOLD;
const visibleChildCount = ref(props.node.children.length);

let childBatchFrameId: number | null = null;

function nextChildCount(startIndex: number, budget: number): number {
  let spent = 0;
  let nextIndex = startIndex;

  while (nextIndex < props.node.children.length) {
    const child = props.node.children[nextIndex];
    const cost = child.descendantCount + 1;

    if (nextIndex > startIndex && spent + cost > budget) {
      break;
    }

    spent += cost;
    nextIndex += 1;

    if (spent >= budget) {
      break;
    }
  }

  return nextIndex;
}

function requiredChildCount(): number {
  let requiredCount = 0;

  for (let index = 0; index < props.node.children.length; index += 1) {
    const child = props.node.children[index];
    if (child.expandForHash || hashPathIds.value.has(child.id)) {
      requiredCount = index + 1;
    }
  }

  return requiredCount;
}

function extendVisibleChildren(budget: number) {
  if (!shouldProgressivelyRenderChildren || visibleChildCount.value >= props.node.children.length || isCollapsed.value) {
    visibleChildCount.value = props.node.children.length;
    return;
  }

  const nextCount = nextChildCount(visibleChildCount.value, budget);
  visibleChildCount.value = Math.min(
    props.node.children.length,
    Math.max(nextCount, requiredChildCount()),
  );
}

function queueNextChildBatch() {
  if (
    !shouldProgressivelyRenderChildren
    || visibleChildCount.value >= props.node.children.length
    || isCollapsed.value
    || childBatchFrameId !== null
  ) {
    return;
  }

  childBatchFrameId = requestAnimationFrame(() => {
    childBatchFrameId = null;
    extendVisibleChildren(FRAME_CHILD_BUDGET);
    queueNextChildBatch();
  });
}

if (shouldProgressivelyRenderChildren) {
  visibleChildCount.value = Math.min(
    props.node.children.length,
    Math.max(nextChildCount(0, INITIAL_CHILD_BUDGET), requiredChildCount()),
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

function confirmFlagAction(event: Event) {
  if (!props.node.flagUrl) {
    return;
  }

  if (!window.confirm(`Are you sure you want to ${flagLabel.value} this?`)) {
    event.preventDefault();
  }
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
            <template v-if="node.isDeleted">
              <span class="comment-node__deleted-meta">[deleted]</span>
              <span class="comment-node__sep" aria-hidden="true">&middot;</span>
              <a :href="node.ageLink" :title="node.ageTimestamp" class="comment-node__age-link">{{ node.age }}</a>
            </template>

            <template v-else>
              <a :href="`user?id=${node.author}`" class="comment-node__author">{{ node.author }}</a>
              <span v-if="node.authorIsNew" class="comment-node__badge comment-node__badge--new" title="New user">New</span>
              <template v-if="node.score != null">
                <span class="comment-node__sep" aria-hidden="true">&middot;</span>
                <span class="comment-node__score">{{ node.score }} {{ node.score === 1 ? 'point' : 'points' }}</span>
              </template>
              <span class="comment-node__sep" aria-hidden="true">&middot;</span>
              <a :href="node.ageLink" :title="node.ageTimestamp" class="comment-node__age-link">{{ node.age }}</a>

              <div v-if="node.isDead || node.isFlagged || downvoteOpacity" class="comment-node__badges">
                <span v-if="node.isDead" class="comment-node__badge comment-node__badge--dead">Dead</span>
                <span v-if="node.isFlagged" class="comment-node__badge comment-node__badge--flagged">Flagged</span>
                <span
                  v-if="downvoteOpacity"
                  class="comment-node__badge comment-node__badge--downvoted"
                  title="Downvoted level"
                >
                  {{ downvoteOpacity }}
                </span>
              </div>
            </template>

            <div v-if="!node.isDeleted && !isCollapsed && hasHeaderNav" class="comment-node__nav">
              <span class="comment-node__sep" aria-hidden="true">&middot;</span>
              <a v-if="node.navLinks.root" :href="node.navLinks.root" class="comment-node__nav-link">root</a>
              <a v-if="node.navLinks.parent" :href="node.navLinks.parent" class="comment-node__nav-link">parent</a>
              <a v-if="node.navLinks.prev" :href="node.navLinks.prev" class="comment-node__nav-link">prev</a>
              <a v-if="node.navLinks.next" :href="node.navLinks.next" class="comment-node__nav-link">next</a>
              <a v-if="node.navLinks.context" :href="node.navLinks.context" class="comment-node__nav-link">context</a>
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
              <div v-if="hasVoteActions" class="comment-node__votes">
                <a
                  v-if="voteHref"
                  :href="voteHref"
                  class="comment-node__vote comment-node__vote--up"
                  :class="{ 'comment-node__vote--active': isUnvoted }"
                  :title="isUnvoted ? 'unvote' : 'upvote'"
                >
                  <span class="comment-node__vote-chevron" aria-hidden="true"></span>
                  <span>{{ isUnvoted ? 'unvote' : 'upvote' }}</span>
                </a>
                <a
                  v-if="node.voteDown"
                  :href="node.voteDown"
                  class="comment-node__vote comment-node__vote--down"
                  title="downvote"
                >
                  <span class="comment-node__vote-chevron" aria-hidden="true"></span>
                  <span>downvote</span>
                </a>
              </div>

              <template v-if="node.replyLink">
                <span v-if="hasVoteActions" class="comment-node__sep" aria-hidden="true">&middot;</span>
                <a :href="node.replyLink" class="comment-node__action-link">reply</a>
              </template>
              <template v-if="node.editUrl">
                <span v-if="hasVoteActions || hasReplyAction" class="comment-node__sep" aria-hidden="true">&middot;</span>
                <a :href="node.editUrl" class="comment-node__action-link">edit</a>
              </template>
              <template v-if="node.deleteUrl">
                <span v-if="hasVoteActions || hasReplyAction || hasEditAction" class="comment-node__sep" aria-hidden="true">&middot;</span>
                <a :href="node.deleteUrl" class="comment-node__action-link comment-node__action-link--delete">delete</a>
              </template>
              <template v-if="node.flagUrl">
                <span v-if="hasVoteActions || hasReplyAction || hasEditAction || hasDeleteAction" class="comment-node__sep" aria-hidden="true">&middot;</span>
                <a :href="node.flagUrl" class="comment-node__action-link" @click="confirmFlagAction">{{ flagLabel }}</a>
              </template>
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
    font-size: 0.8rem;
    color: var(--color-text-muted);
  }

  &__toggle {
    margin-right: 0.15rem;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-weight: 700;
    color: var(--color-text-muted);
    transition: color 0.15s ease;

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

  &__sep {
    color: var(--color-text-muted);
    font-weight: 900;
    user-select: none;
    opacity: 0.6;
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
    gap: 0.5rem;
    font-size: 0.7rem;
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

  &__nav-link {
    color: inherit;
    text-decoration: none;

    &:hover {
      color: var(--color-accent);
      text-decoration: underline;
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
    margin-top: 0.2rem;
  }

  &__actions {
    margin-top: 0.2rem;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.8rem;
    font-weight: 600;
    color: var(--color-text-muted);
    flex-wrap: wrap;
  }

  &__votes {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    margin-right: 0.1rem;
  }

  &__vote {
    display: flex;
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
      top: -5px;
      left: -5px;
      right: -5px;
      bottom: -5px;
    }

    &:hover {
      color: var(--color-accent);
      text-decoration: none;
    }

    &--active {
      color: var(--color-accent);
    }

    &--down .comment-node__vote-chevron {
      transform: rotate(180deg);
    }
  }

  &__vote-chevron {
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-bottom: 8px solid currentColor;
  }

  &__action-link {
    color: inherit;
    text-decoration: none;

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
