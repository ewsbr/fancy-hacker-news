import type { InjectionKey, Ref } from 'vue';
import type { CommentNode } from '@/parsers/item';
import { useResizeObserver } from '@vueuse/core';
import { computed, inject, provide, ref } from 'vue';
import { COMMENT_HEIGHT_ESTIMATE as SIZE } from '@/constants/comment-rendering';
import { createCommentHeightEstimator } from '@/content/utils/comment-height';
import { COMMENT_FRAGMENT_STATE_KEY } from '@/state/fragment-state';

type HeightEstimator = ReturnType<typeof createCommentHeightEstimator>;
const COMMENT_HEIGHT_KEY: InjectionKey<Ref<HeightEstimator>> = Symbol('comment-height');

/** Each scroll surface shares estimates; mobile modals have their own width and inline depth. */
export function provideCommentHeightEstimates(
  element: Ref<HTMLElement | null>,
  options: { inModal?: boolean; enableMobileSubthreads?: boolean } = {},
) {
  const isMobileLayout = inject<boolean>('isMobileLayout', false);
  const fragment = inject(COMMENT_FRAGMENT_STATE_KEY, null);
  const width = ref(Math.min(window.innerWidth, options.inModal ? SIZE.modalMaxWidthPx : SIZE.contentMaxWidthPx) - SIZE.contentInsetPx);
  const fontSize = Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  useResizeObserver(element, ([entry]) => {
    if (entry.contentRect.width > 0) width.value = entry.contentRect.width;
  });
  const estimate = computed(() => createCommentHeightEstimator({
    width: width.value,
    fontSize,
    isMobileLayout,
    inModal: options.inModal ?? false,
    enableMobileSubthreads: options.enableMobileSubthreads ?? true,
    hashPathIds: fragment?.hashPathIds.value ?? new Set<string>(),
    hashTargetId: fragment?.hashTargetId.value ?? null,
  }));
  provide(COMMENT_HEIGHT_KEY, estimate);
  return estimate;
}

/** A prefix sum makes each batch's remaining space O(1), with no DOM measurements. */
export function useCommentPlaceholderHeight(
  comments: () => CommentNode[],
  visibleCount: () => number,
  depth: number,
  gap: number,
) {
  const estimate = inject(COMMENT_HEIGHT_KEY, null);
  const cumulative = computed(() => {
    const sums = [0];
    if (estimate) {
      for (const node of comments()) sums.push(sums[sums.length - 1] + estimate.value(node, depth) + gap);
    }
    return sums;
  });
  return computed(() => {
    const count = visibleCount();
    if (!estimate || count >= comments().length) return 0;
    const sums = cumulative.value;
    return Math.max(0, sums[sums.length - 1] - sums[count] - gap);
  });
}
