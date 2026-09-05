// @vitest-environment jsdom

import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h } from 'vue';
import { provideCommentFragmentLoading } from '@/content/composables/comment-fragment-loading';

function mountLoading() {
  let loading!: ReturnType<typeof provideCommentFragmentLoading>;
  const wrapper = mount(defineComponent({
    setup() {
      loading = provideCommentFragmentLoading();
      return () => h('div');
    },
  }));
  return { loading, wrapper };
}

describe('fragment loading lifetime', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(document, 'hidden', 'get').mockReturnValue(false);
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    Object.defineProperty(history, 'scrollRestoration', { configurable: true, writable: true, value: 'auto' });
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('waits for both page and modal positioning, and delays the activity message', () => {
    const { loading, wrapper } = mountLoading();
    const page = loading.begin('linked-comment');
    const modal = loading.track('linked-comment');
    expect(loading.isPending.value).toBe(true);
    expect(loading.showIndicator.value).toBe(false);
    expect(loading.isInitialNavigation.value).toBe(true);

    vi.advanceTimersByTime(200);
    expect(loading.showIndicator.value).toBe(true);
    page.finish();
    page.finish();
    expect(loading.isPending.value).toBe(true);
    modal.finish();
    expect(loading.isPending.value).toBe(false);
    expect(loading.showIndicator.value).toBe(false);

    const later = loading.begin('another-comment');
    expect(loading.isInitialNavigation.value).toBe(false);
    later.finish();
    wrapper.unmount();
  });

  it('resets the extension scroll container only for initial loading and suspends restoration until positioned', () => {
    const root = document.createElement('div');
    root.id = 'fancy-hn-root';
    root.scrollTop = 2400;
    root.scrollTo = vi.fn(() => {
      root.scrollTop = 0;
    });
    document.body.appendChild(root);
    const { loading, wrapper } = mountLoading();
    try {
      const page = loading.begin('linked-comment');
      const modal = loading.track('linked-comment');
      expect(root.scrollTop).toBe(0);
      expect(root.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'instant' });
      expect(history.scrollRestoration).toBe('manual');
      root.scrollTop = 2400;
      vi.advanceTimersByTime(200);
      expect(loading.showIndicator.value).toBe(true);
      expect(root.scrollTop).toBe(0);
      page.finish();
      expect(history.scrollRestoration).toBe('manual');
      modal.finish();
      expect(history.scrollRestoration).toBe('auto');

      root.scrollTop = 1800;
      const later = loading.begin('another-comment');
      vi.advanceTimersByTime(200);
      expect(root.scrollTop).toBe(1800);
      expect(history.scrollRestoration).toBe('auto');
      later.finish();
    } finally {
      wrapper.unmount();
      root.remove();
    }
  });

  it('does not show loading for a normal load or flash the activity message for a fast fragment', () => {
    const { loading, wrapper } = mountLoading();
    loading.begin(null).finish();
    expect(loading.isPending.value).toBe(false);
    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(history.scrollRestoration).toBe('auto');
    const quick = loading.begin('comment');
    quick.finish();
    vi.runAllTimers();
    expect(loading.showIndicator.value).toBe(false);
    expect(loading.isPending.value).toBe(false);
    wrapper.unmount();
  });

  it('does not reset scrolling once either surface starts positioning its target', () => {
    const { loading, wrapper } = mountLoading();
    const page = loading.begin('linked-comment');
    const modal = loading.track('linked-comment');
    modal.startPositioning();
    modal.finish();
    vi.mocked(window.scrollTo).mockClear();
    vi.advanceTimersByTime(200);
    expect(loading.showIndicator.value).toBe(true);
    expect(window.scrollTo).not.toHaveBeenCalled();
    page.finish();
    wrapper.unmount();
  });

  it('invalidates superseded work, even when returning to the same fragment', () => {
    const { loading, wrapper } = mountLoading();
    const first = loading.begin('a');
    const modal = loading.track('a');
    const second = loading.begin('b');
    const latest = loading.begin('a');
    expect(first.isCurrent()).toBe(false);
    expect(modal.isCurrent()).toBe(false);
    expect(second.isCurrent()).toBe(false);
    first.finish();
    modal.finish();
    second.finish();
    expect(loading.isPending.value).toBe(true);
    expect(latest.isCurrent()).toBe(true);

    loading.begin(null);
    expect(latest.isCurrent()).toBe(false);
    expect(loading.isPending.value).toBe(false);
    expect(history.scrollRestoration).toBe('auto');
    const closingModal = loading.begin('modal-comment');
    loading.cancel();
    expect(closingModal.isCurrent()).toBe(false);
    expect(loading.isPending.value).toBe(false);
    wrapper.unmount();
  });

  it('releases the cover and prevents late scrolling after timeout or unmount', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { loading, wrapper } = mountLoading();
    const timedOut = loading.begin('slow-comment');
    vi.runAllTimers();
    expect(loading.isPending.value).toBe(false);
    expect(timedOut.isCurrent()).toBe(false);
    expect(warning).toHaveBeenCalled();
    expect(history.scrollRestoration).toBe('auto');

    const disposed = loading.begin('another-comment');
    wrapper.unmount();
    expect(disposed.isCurrent()).toBe(false);
    expect(loading.isPending.value).toBe(false);
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(['auto', 'manual'] as const)('restores %s scroll restoration when disposed during initial loading', (mode) => {
    history.scrollRestoration = mode;
    const { loading, wrapper } = mountLoading();
    loading.begin('linked-comment');
    wrapper.unmount();
    expect(history.scrollRestoration).toBe(mode);
  });

  it('does not expire navigation while rendering is paused in a background tab', () => {
    const { loading, wrapper } = mountLoading();
    const task = loading.begin('background-comment');
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    document.dispatchEvent(new Event('visibilitychange'));
    vi.runAllTimers();
    expect(loading.isPending.value).toBe(true);
    expect(task.isCurrent()).toBe(true);

    hidden.mockReturnValue(false);
    document.dispatchEvent(new Event('visibilitychange'));
    task.finish();
    vi.runAllTimers();
    expect(loading.isPending.value).toBe(false);
    wrapper.unmount();
  });
});
