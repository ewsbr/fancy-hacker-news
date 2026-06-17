import type { Ref } from 'vue';
import type { FlagActionTarget, VoteActionTarget } from '@/content/composables/use-hn-actions';
import type { CommentNode as CommentNodeType } from '@/parsers/item';
import type { ThreadEntry } from '@/parsers/threads';
import type { CommentFragmentState } from '@/state/fragment-state';
import { onLongPress } from '@vueuse/core';
import { computed, inject, onScopeDispose, provide, reactive, ref, shallowRef, watch } from 'vue';
import {
  COMMENT_THREAD_ROOT_AUTHOR_KEY,
  COMMENT_THREAD_STORY_AUTHOR_KEY,
  getOriginalPosterTitle,
} from '@/content/utils/comment-badges';
import { COMMENT_FRAGMENT_STATE_KEY } from '@/state/fragment-state';

const MOBILE_MODAL_DEPTH = 4;
const COMMENT_LONG_PRESS_DELAY = 525;
const COMMENT_LONG_PRESS_HEADER_SELECTOR = '.comment-node__header';
const COMMENT_LONG_PRESS_LINE_SELECTOR = '.comment-node__line';
const COMMENT_LONG_PRESS_TARGET_SELECTOR = [
  COMMENT_LONG_PRESS_HEADER_SELECTOR,
  COMMENT_LONG_PRESS_LINE_SELECTOR,
].join(',');
const COMMENT_LONG_PRESS_INTERACTIVE_SELECTOR = [
  'a',
  'button',
  'input',
  'textarea',
  'select',
  '[contenteditable="true"]',
].join(',');

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

interface CommentThreadUiEligibilityInput {
  isMobileLayout: boolean;
  inModal: boolean | undefined;
  enableMobileSubthreads: boolean | undefined;
  depth: number | undefined;
  childCount: number;
}

interface CommentCollapseRegistry {
  register: (id: string, toggleCollapse: () => void) => () => void;
  toggle: (id: string) => boolean;
}

interface CommentActionStateRegistry {
  getVoteTarget: (node: CommentRenderableNode) => VoteActionTarget | null;
  getFlagTarget: (node: CommentRenderableNode) => FlagActionTarget | null;
}

const COMMENT_COLLAPSE_REGISTRY_KEY = Symbol('comment-collapse-registry');
const COMMENT_ACTION_STATE_REGISTRY_KEY = Symbol('comment-action-state-registry');

function isThreadEntry(node: CommentRenderableNode): node is ThreadEntry {
  return 'onStory' in node;
}

function findLongPressCollapseTarget(target: Element): HTMLElement | null {
  const pressTarget = target.closest<HTMLElement>(COMMENT_LONG_PRESS_TARGET_SELECTOR);
  if (!pressTarget) {
    return null;
  }

  const isThreadLine = pressTarget.matches(COMMENT_LONG_PRESS_LINE_SELECTOR);
  if (!isThreadLine && target.closest(COMMENT_LONG_PRESS_INTERACTIVE_SELECTOR)) {
    return null;
  }

  return pressTarget.closest<HTMLElement>('.comment-node');
}

export function provideCommentCollapseRegistry(longPressCommentCollapse: boolean): CommentCollapseRegistry | null {
  if (!longPressCommentCollapse) {
    provide(COMMENT_COLLAPSE_REGISTRY_KEY, null);
    return null;
  }

  const collapseHandlers = new Map<string, Array<() => void>>();

  const registry: CommentCollapseRegistry = {
    register(id, toggleCollapse) {
      const handlers = collapseHandlers.get(id) ?? [];
      handlers.push(toggleCollapse);
      collapseHandlers.set(id, handlers);

      return () => {
        const currentHandlers = collapseHandlers.get(id);
        if (!currentHandlers) {
          return;
        }

        const index = currentHandlers.lastIndexOf(toggleCollapse);
        if (index >= 0) {
          currentHandlers.splice(index, 1);
        }

        if (currentHandlers.length === 0) {
          collapseHandlers.delete(id);
        }
      };
    },
    toggle(id) {
      const handlers = collapseHandlers.get(id);
      const toggleCollapse = handlers?.[handlers.length - 1];

      if (!toggleCollapse) {
        return false;
      }

      toggleCollapse();
      return true;
    },
  };

  provide(COMMENT_COLLAPSE_REGISTRY_KEY, registry);

  return registry;
}

function createCommentVoteTarget(node: CommentRenderableNode): VoteActionTarget {
  return reactive({
    voteState: node.voteState,
  });
}

function createCommentFlagTarget(node: CommentRenderableNode): FlagActionTarget {
  return reactive({
    flagAction: node.flagAction,
    isFlagged: node.isFlagged,
  });
}

export function provideCommentActionStateRegistry(): CommentActionStateRegistry {
  const voteTargets = new Map<string, VoteActionTarget>();
  const flagTargets = new Map<string, FlagActionTarget>();

  const registry: CommentActionStateRegistry = {
    getVoteTarget(node) {
      if (node.voteState.kind === 'unavailable') {
        return null;
      }

      const currentTarget = voteTargets.get(node.id);
      if (currentTarget) {
        return currentTarget;
      }

      const target = createCommentVoteTarget(node);
      voteTargets.set(node.id, target);
      return target;
    },
    getFlagTarget(node) {
      if (node.flagAction.kind !== 'available' && node.flagAction.kind !== 'active') {
        return null;
      }

      const currentTarget = flagTargets.get(node.id);
      if (currentTarget) {
        return currentTarget;
      }

      const target = createCommentFlagTarget(node);
      flagTargets.set(node.id, target);
      return target;
    },
  };

  provide(COMMENT_ACTION_STATE_REGISTRY_KEY, registry);

  return registry;
}

export function useCommentVoteActionTarget(node: Ref<CommentRenderableNode>): VoteActionTarget | null {
  if (node.value.voteState.kind === 'unavailable') {
    return null;
  }

  const registry = inject<CommentActionStateRegistry | null>(COMMENT_ACTION_STATE_REGISTRY_KEY, null);

  return registry?.getVoteTarget(node.value) ?? createCommentVoteTarget(node.value);
}

export function useCommentFlagActionTarget(node: Ref<CommentRenderableNode>): FlagActionTarget | null {
  if (node.value.flagAction.kind !== 'available' && node.value.flagAction.kind !== 'active') {
    return null;
  }

  const registry = inject<CommentActionStateRegistry | null>(COMMENT_ACTION_STATE_REGISTRY_KEY, null);

  return registry?.getFlagTarget(node.value) ?? createCommentFlagTarget(node.value);
}

export function useCommentCollapseRegistry(): CommentCollapseRegistry | null {
  return inject<CommentCollapseRegistry | null>(COMMENT_COLLAPSE_REGISTRY_KEY, null);
}

export function useCommentCollapseRegistration(node: Ref<CommentRenderableNode>, toggleCollapse: () => void) {
  const registry = useCommentCollapseRegistry();

  if (!registry) {
    return;
  }

  const unregister = registry.register(node.value.id, toggleCollapse);

  onScopeDispose(() => {
    unregister();
  });
}

export function useDelegatedCommentLongPress(
  target: Ref<HTMLElement | null>,
  registry: CommentCollapseRegistry | null,
) {
  if (!registry) {
    return;
  }

  function preventLongPressContextMenu(event: MouseEvent) {
    const targetElement = event.target instanceof Element ? event.target : null;
    if (targetElement && findLongPressCollapseTarget(targetElement)) {
      event.preventDefault();
    }
  }

  const stopContextMenuListener = watch(
    target,
    (element, _previousElement, onCleanup) => {
      element?.addEventListener('contextmenu', preventLongPressContextMenu);

      onCleanup(() => {
        element?.removeEventListener('contextmenu', preventLongPressContextMenu);
      });
    },
    { immediate: true },
  );

  onLongPress(
    target,
    (event) => {
      const targetElement = event.target instanceof Element ? event.target : null;
      if (!targetElement) {
        return;
      }

      const commentElement = findLongPressCollapseTarget(targetElement);

      if (commentElement?.id) {
        registry.toggle(commentElement.id);
      }
    },
    { delay: COMMENT_LONG_PRESS_DELAY },
  );

  onScopeDispose(() => {
    stopContextMenuListener();
  });
}

export function useCommentDisplayContext({
  node,
  threadAuthor,
  showLocalThreadAuthor,
  showOnStory,
  rootVariant,
}: CommentDisplayContextOptions) {
  const threadRootAuthor = inject(COMMENT_THREAD_ROOT_AUTHOR_KEY, null);
  const storyAuthor = inject(COMMENT_THREAD_STORY_AUTHOR_KEY, null);

  const latestUrl = computed(() => `latest?id=${encodeURIComponent(node.value.id)}`);
  const resolvedThreadAuthor = computed(() => threadAuthor.value
    ?? threadRootAuthor
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

export function getCommentThreadUiEligibility({
  isMobileLayout,
  inModal,
  enableMobileSubthreads,
  depth,
  childCount,
}: CommentThreadUiEligibilityInput) {
  const currentDepth = depth ?? 0;

  return {
    currentDepth,
    usesMobileSubthreadModal: isMobileLayout
      && !inModal
      && enableMobileSubthreads !== false
      && currentDepth >= MOBILE_MODAL_DEPTH
      && childCount > 0,
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
  const { currentDepth, usesMobileSubthreadModal } = getCommentThreadUiEligibility({
    isMobileLayout,
    inModal: inModal.value,
    enableMobileSubthreads: enableMobileSubthreads.value,
    depth: depth.value,
    childCount: node.value.children.length,
  });

  if (!usesMobileSubthreadModal) {
    return {
      childrenInModal: false,
      closeModal: () => {},
      currentDepth,
      isModalOpen: false,
      openModal: () => {},
      threadButtonLabel: '',
    };
  }

  const isModalOpen = ref(false);
  const directReplyCount = computed(() => node.value.children.length);
  const totalReplyCount = computed(() => node.value.descendantCount);
  const nestedReplyCount = computed(() => Math.max(0, totalReplyCount.value - directReplyCount.value));
  const threadButtonLabel = computed(() => {
    const directReplyLabel = directReplyCount.value === 1 ? 'reply' : 'replies';

    if (nestedReplyCount.value > 0) {
      return `View ${directReplyCount.value} ${directReplyLabel} (${totalReplyCount.value} total)`;
    }

    return `View ${directReplyCount.value} ${directReplyLabel}`;
  });

  watch(
    isInHashPath,
    (inHashPath) => {
      if (inHashPath) {
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
    childrenInModal: true,
    closeModal,
    currentDepth,
    isModalOpen,
    openModal,
    threadButtonLabel,
  };
}
