import type { Ref } from 'vue';
import type { CommentNode as CommentNodeType } from '@/parsers/item';
import type { ThreadEntry } from '@/parsers/threads';
import type { CommentFragmentState } from '@/state/fragment-state';
import { computed, inject, ref, shallowRef, watch } from 'vue';
import {
  COMMENT_THREAD_ROOT_AUTHOR_KEY,
  COMMENT_THREAD_STORY_AUTHOR_KEY,
  getOriginalPosterTitle,
} from '@/content/utils/comment-badges';
import { COMMENT_FRAGMENT_STATE_KEY } from '@/state/fragment-state';

const MOBILE_MODAL_DEPTH = 4;

export type CommentRenderableNode = CommentNodeType | ThreadEntry;
export type CommentRootVariant = 'default' | 'thread';

interface CommentDisplayContextOptions {
  node: Ref<CommentRenderableNode>;
  parentAuthor: Ref<string | null | undefined>;
  threadAuthor: Ref<string | null | undefined>;
  showLocalThreadAuthor: Ref<boolean | undefined>;
  showOnStory: Ref<boolean | undefined>;
  rootVariant: Ref<CommentRootVariant | undefined>;
}

interface CommentFragmentStateOptions {
  node: Ref<CommentRenderableNode>;
  inModal: Ref<boolean | undefined>;
}

interface CommentThreadUiOptions {
  node: Ref<CommentRenderableNode>;
  depth: Ref<number | undefined>;
  inModal: Ref<boolean | undefined>;
  enableMobileSubthreads: Ref<boolean | undefined>;
  isInHashPath: Ref<boolean>;
}

function isThreadEntry(node: CommentRenderableNode): node is ThreadEntry {
  return 'onStory' in node;
}

export function useCommentDisplayContext({
  node,
  parentAuthor,
  threadAuthor,
  showLocalThreadAuthor,
  showOnStory,
  rootVariant,
}: CommentDisplayContextOptions) {
  const injectedThreadAuthor = inject(COMMENT_THREAD_ROOT_AUTHOR_KEY, null);
  const storyAuthor = inject(COMMENT_THREAD_STORY_AUTHOR_KEY, null);

  const latestUrl = computed(() => `latest?id=${encodeURIComponent(node.value.id)}`);
  const resolvedThreadAuthor = computed(() => threadAuthor.value
    ?? injectedThreadAuthor
    ?? (showLocalThreadAuthor.value ? node.value.author : null));
  const nodeOnStory = computed<{ title: string; link: string } | null>(() => {
    if (!showOnStory.value || !isThreadEntry(node.value)) {
      return null;
    }

    return node.value.onStory;
  });
  const originalPosterTitle = computed(() => getOriginalPosterTitle({
    author: node.value.author,
    storyAuthor,
    threadAuthor: resolvedThreadAuthor.value,
    parentAuthor: parentAuthor.value,
  }));
  const rootClassName = computed(() => {
    if (node.value.indent > 0) {
      return 'comment-node--nested';
    }

    return rootVariant.value === 'thread'
      ? 'comment-node--thread-root'
      : 'comment-node--root';
  });

  return {
    latestUrl,
    nodeOnStory,
    originalPosterTitle,
    resolvedThreadAuthor,
    rootClassName,
  };
}

export function useCommentFragmentState({ node, inModal }: CommentFragmentStateOptions) {
  const fragmentState = inject<CommentFragmentState>(COMMENT_FRAGMENT_STATE_KEY, {
    hashPathIds: shallowRef(new Set<string>()),
    hashTargetId: ref<string | null>(null),
    mainThreadHashTargetId: ref<string | null>(null),
    hashNavigationVersion: ref(0),
  });
  const { hashPathIds, hashTargetId, mainThreadHashTargetId, hashNavigationVersion } = fragmentState;

  const isHashTarget = computed(() => hashTargetId.value === node.value.id);
  const isMainThreadHashTarget = computed(() => mainThreadHashTargetId.value === node.value.id);
  const isHighlightedForHash = computed(() => (inModal.value ? isHashTarget.value : isMainThreadHashTarget.value));
  const isInHashPath = computed(() => node.value.expandForHash || hashPathIds.value.has(node.value.id));
  const isForcedExpanded = computed(() => isInHashPath.value && !isHashTarget.value);

  return {
    hashNavigationVersion,
    hashTargetId,
    isForcedExpanded,
    isHighlightedForHash,
    isInHashPath,
  };
}

export function useCommentThreadUi({
  node,
  depth,
  inModal,
  enableMobileSubthreads,
  isInHashPath,
}: CommentThreadUiOptions) {
  // Deliberately a mount-time snapshot. Recomputing this across a very large
  // comment tree on breakpoint changes would fan out reactive work to thousands
  // of nodes, so resize correctness is traded for tree stability here.
  const isMobileLayout = inject<boolean>('isMobileLayout', false);
  const isModalOpen = ref(false);

  const currentDepth = computed(() => depth.value ?? 0);
  const directReplyCount = computed(() => node.value.children.length);
  const totalReplyCount = computed(() => node.value.descendantCount);
  const nestedReplyCount = computed(() => Math.max(0, totalReplyCount.value - directReplyCount.value));
  const childrenInModal = computed(() => enableMobileSubthreads.value
    && isMobileLayout
    && !inModal.value
    && currentDepth.value >= MOBILE_MODAL_DEPTH);
  const threadButtonLabel = computed(() => {
    const directReplyLabel = directReplyCount.value === 1 ? 'reply' : 'replies';

    if (nestedReplyCount.value > 0) {
      return `View ${directReplyCount.value} ${directReplyLabel} (${totalReplyCount.value} total)`;
    }

    return `View ${directReplyCount.value} ${directReplyLabel}`;
  });

  watch(
    [childrenInModal, isInHashPath],
    ([shouldUseModal, inHashPath]) => {
      if (shouldUseModal && inHashPath) {
        isModalOpen.value = true;
      }
    },
    { immediate: true },
  );

  function openModal() {
    isModalOpen.value = true;
  }

  function closeModal() {
    isModalOpen.value = false;
  }

  return {
    childrenInModal,
    closeModal,
    currentDepth,
    isModalOpen,
    openModal,
    threadButtonLabel,
  };
}
