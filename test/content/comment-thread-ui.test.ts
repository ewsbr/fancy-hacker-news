// @vitest-environment jsdom

import type { CommentRenderableNode } from '@/content/composables/comment-node';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { defineComponent, h, nextTick, ref, toValue } from 'vue';
import {
  getCommentThreadUiEligibility,
  useCommentThreadUi,
} from '@/content/composables/comment-node';

interface EligibilityInput {
  isMobileLayout: boolean;
  inModal: boolean;
  enableMobileSubthreads: boolean;
  depth: number;
  childCount: number;
}

interface ThreadUiHarnessOptions {
  isMobileLayout: boolean;
  depth: number;
  childCount: number;
  descendantCount?: number;
  inModal?: boolean;
  enableMobileSubthreads?: boolean;
}

function makeEligibilityInput(overrides: Partial<EligibilityInput> = {}): EligibilityInput {
  return {
    isMobileLayout: true,
    inModal: false,
    enableMobileSubthreads: true,
    depth: 4,
    childCount: 1,
    ...overrides,
  };
}

function makeRenderableNode(childCount: number, descendantCount = childCount): CommentRenderableNode {
  const children = Array.from({ length: childCount }, (_value, index) => ({
    id: `child-${index}`,
    children: [],
    descendantCount: 0,
  })) as unknown as CommentRenderableNode[];

  return {
    id: 'parent',
    children,
    descendantCount,
  } as unknown as CommentRenderableNode;
}

function mountThreadUiHarness(options: ThreadUiHarnessOptions) {
  const isInHashPath = ref(false);
  const state: {
    ui?: ReturnType<typeof useCommentThreadUi>;
  } = {};

  const Harness = defineComponent({
    setup() {
      state.ui = useCommentThreadUi({
        node: ref(makeRenderableNode(options.childCount, options.descendantCount)),
        depth: ref(options.depth),
        inModal: ref(options.inModal),
        enableMobileSubthreads: ref(options.enableMobileSubthreads),
        isInHashPath,
      });

      return () => h('div');
    },
  });

  const wrapper = mount(Harness, {
    global: {
      provide: {
        isMobileLayout: options.isMobileLayout,
      },
    },
  });

  if (!state.ui) {
    throw new Error('Comment thread UI harness did not initialize');
  }

  return {
    isInHashPath,
    ui: state.ui,
    wrapper,
  };
}

describe('comment thread UI eligibility', () => {
  it('rejects non-mobile layout', () => {
    expect(getCommentThreadUiEligibility(makeEligibilityInput({
      isMobileLayout: false,
    })).usesMobileSubthreadModal).toBe(false);
  });

  it('rejects disabled mobile subthreads', () => {
    expect(getCommentThreadUiEligibility(makeEligibilityInput({
      enableMobileSubthreads: false,
    })).usesMobileSubthreadModal).toBe(false);
  });

  it('rejects nodes already inside a modal', () => {
    expect(getCommentThreadUiEligibility(makeEligibilityInput({
      inModal: true,
    })).usesMobileSubthreadModal).toBe(false);
  });

  it('rejects shallow nodes below the mobile modal depth', () => {
    expect(getCommentThreadUiEligibility(makeEligibilityInput({
      depth: 3,
    })).usesMobileSubthreadModal).toBe(false);
  });

  it('rejects leaf nodes', () => {
    expect(getCommentThreadUiEligibility(makeEligibilityInput({
      childCount: 0,
    })).usesMobileSubthreadModal).toBe(false);
  });

  it('keeps mobile page nodes at the modal depth eligible when they have children', () => {
    expect(getCommentThreadUiEligibility(makeEligibilityInput())).toEqual({
      currentDepth: 4,
      usesMobileSubthreadModal: true,
    });
  });
});

describe('useCommentThreadUi', () => {
  it('opens an eligible mobile subthread modal when the hash target enters the subtree', async () => {
    const { isInHashPath, ui, wrapper } = mountThreadUiHarness({
      isMobileLayout: true,
      depth: 4,
      childCount: 1,
      descendantCount: 3,
      inModal: false,
      enableMobileSubthreads: true,
    });

    expect(ui.childrenInModal).toBe(true);
    expect(toValue(ui.isModalOpen)).toBe(false);

    isInHashPath.value = true;
    await nextTick();

    expect(toValue(ui.isModalOpen)).toBe(true);

    wrapper.unmount();
  });

  it('does not open an ineligible subthread modal for hash-path nodes', async () => {
    const { isInHashPath, ui, wrapper } = mountThreadUiHarness({
      isMobileLayout: true,
      depth: 3,
      childCount: 1,
      inModal: false,
      enableMobileSubthreads: true,
    });

    expect(ui.childrenInModal).toBe(false);
    expect(toValue(ui.isModalOpen)).toBe(false);

    isInHashPath.value = true;
    await nextTick();

    expect(toValue(ui.isModalOpen)).toBe(false);

    wrapper.unmount();
  });
});
