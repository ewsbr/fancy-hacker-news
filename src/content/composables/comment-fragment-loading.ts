import type { InjectionKey } from 'vue';
import { useEventListener } from '@vueuse/core';
import { inject, onScopeDispose, provide, readonly, ref } from 'vue';
import { FRAGMENT_LOADING_DELAY_MS, FRAGMENT_NAVIGATION_TIMEOUT_MS, INITIAL_COMMENT_LOADING_CLASS } from '@/constants/comment-navigation';
import { getExtensionRootHost } from '@/content/utils/root-host';
import { createLogger } from '@/debug';

export interface FragmentLoadingTask {
  isCurrent: () => boolean;
  /** Stop delayed top resets before either surface scrolls to its target. */
  startPositioning: () => void;
  finish: () => void;
}

type FragmentLoading = ReturnType<typeof provideCommentFragmentLoading>;
const FRAGMENT_LOADING_KEY: InjectionKey<Omit<FragmentLoading, 'begin'>> = Symbol('comment-fragment-loading');

/** Page and portaled modal positioning share one navigation lifetime. */
export function provideCommentFragmentLoading() {
  const isPending = ref(false);
  const showIndicator = ref(false);
  const isInitialNavigation = ref(true);
  const tasks = new Set<symbol>();
  const logger = createLogger('comment-fragment');
  let targetId: string | null = null;
  let version = 0;
  let indicatorTimer = 0;
  let timeoutTimer = 0;
  let previousScrollRestoration: ScrollRestoration | null = null;
  let positioningStarted = false;

  function clearTimers() {
    clearTimeout(indicatorTimer);
    clearTimeout(timeoutTimer);
  }

  function resetInitialScroll() {
    if (!isInitialNavigation.value || positioningStarted) return;
    getExtensionRootHost()?.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }

  // Firefox may retry inner-scroll restoration as placeholder geometry changes.
  useEventListener(getExtensionRootHost(), 'scroll', () => {
    if (isPending.value) resetInitialScroll();
  }, { passive: true });

  function settle() {
    clearTimers();
    getExtensionRootHost()?.classList.remove(INITIAL_COMMENT_LOADING_CLASS);
    if (previousScrollRestoration !== null) {
      history.scrollRestoration = previousScrollRestoration;
      previousScrollRestoration = null;
    }
    tasks.clear();
    isPending.value = false;
    showIndicator.value = false;
    isInitialNavigation.value = false;
  }

  function cancel() {
    version += 1;
    settle();
  }

  function armTimeout() {
    clearTimeout(timeoutTimer);
    if (!isPending.value || document.hidden) return;
    timeoutTimer = window.setTimeout(() => {
      logger.warn('Timed out opening linked comment; showing the thread', { targetId });
      cancel();
    }, FRAGMENT_NAVIGATION_TIMEOUT_MS);
  }

  // Rendering frames pause in background tabs; their deep links must not expire.
  useEventListener(document, 'visibilitychange', armTimeout);

  function track(id: string | null): FragmentLoadingTask {
    const task = Symbol('fragment-positioning');
    const taskVersion = version;
    if (isPending.value && targetId === id) tasks.add(task);
    const isCurrent = () => version === taskVersion && targetId === id;
    return {
      isCurrent,
      startPositioning() {
        if (isCurrent()) positioningStarted = true;
      },
      finish() {
        if (isCurrent() && tasks.delete(task) && tasks.size === 0) settle();
      },
    };
  }

  function begin(id: string | null): FragmentLoadingTask {
    version += 1;
    targetId = id;
    clearTimers();
    tasks.clear();
    isPending.value = id !== null;
    showIndicator.value = false;
    positioningStarted = false;
    if (id === null) {
      settle();
    } else {
      if (isInitialNavigation.value && previousScrollRestoration === null) {
        getExtensionRootHost()?.classList.add(INITIAL_COMMENT_LOADING_CLASS);
        // Refresh can restore the extension's scroll container after mounting.
        previousScrollRestoration = history.scrollRestoration;
        history.scrollRestoration = 'manual';
        resetInitialScroll();
      }
      indicatorTimer = window.setTimeout(() => {
        // Firefox can restore an inner scroller after mount despite manual history restoration.
        resetInitialScroll();
        showIndicator.value = true;
      }, FRAGMENT_LOADING_DELAY_MS);
      armTimeout();
    }
    return track(id);
  }

  onScopeDispose(cancel);

  const loading = {
    isPending: readonly(isPending),
    showIndicator: readonly(showIndicator),
    isInitialNavigation: readonly(isInitialNavigation),
    begin,
    cancel,
    track,
  };
  provide(FRAGMENT_LOADING_KEY, loading);
  return loading;
}

export function useCommentFragmentLoading() {
  return inject(FRAGMENT_LOADING_KEY, null);
}
