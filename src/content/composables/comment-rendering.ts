import type { InjectionKey } from 'vue';
import { until } from '@vueuse/core';
import { computed, inject, nextTick, onMounted, onScopeDispose, provide, ref, watch } from 'vue';
import { COMMENT_RENDER_BUDGET_MS, INITIAL_COMMENT_RENDER_COUNT } from '@/constants/comment-rendering';
import { COMMENT_FRAGMENT_STATE_KEY } from '@/state/fragment-state';

interface RenderableComment {
  id: string;
  children: RenderableComment[];
  expandForHash?: boolean;
}

interface RenderTask {
  advance: () => boolean;
  active: boolean;
}

interface CommentRendering {
  initialIds: Set<string>;
  enqueue: (advance: () => boolean) => () => void;
  whenIdle: () => Promise<void>;
}

const COMMENT_RENDERING_KEY: InjectionKey<CommentRendering> = Symbol('comment-rendering');

/** One queue for the whole tree prevents a large root from monopolizing mount. */
export function provideCommentRendering(comments: RenderableComment[]) {
  const initialIds = new Set<string>();
  const remaining = [...comments].reverse();
  while (remaining.length && initialIds.size < INITIAL_COMMENT_RENDER_COUNT) {
    const node = remaining.pop()!;
    initialIds.add(node.id);
    remaining.push(...[...node.children].reverse());
  }

  const tasks: RenderTask[] = [];
  const isRendering = ref(false);
  let started = false;
  let disposed = false;
  let running = false;
  let frame = 0;
  let timer = 0;

  async function whenIdle() {
    await until(isRendering).toBe(false);
  }

  function schedule() {
    if (!started || disposed || running || frame || timer || !tasks.length) {
      return;
    }
    // Run after a paint, not inside its animation-frame callback.
    frame = requestAnimationFrame(() => {
      frame = 0;
      timer = window.setTimeout(() => {
        timer = 0;
        void runBatch();
      }, 0);
    });
  }

  async function runBatch() {
    running = true;
    const deadline = performance.now() + COMMENT_RENDER_BUDGET_MS;
    while (tasks.length && performance.now() < deadline) {
      if (disposed) {
        break;
      }
      const task = tasks[tasks.length - 1];
      if (!task.active || !task.advance()) {
        tasks.pop();
      }
      // New child lists join the top of the stack during this update, so a
      // thread fills in before the queue proceeds to its later siblings.
      await nextTick();
    }
    running = false;
    isRendering.value = !disposed && tasks.length > 0;
    schedule();
  }

  provide(COMMENT_RENDERING_KEY, {
    initialIds,
    whenIdle,
    enqueue(advance) {
      const task = { advance, active: true };
      tasks.push(task);
      isRendering.value = true;
      schedule();
      return () => {
        task.active = false;
      };
    },
  });

  onMounted(() => {
    // Leave the initial paint free of background component creation.
    frame = requestAnimationFrame(() => {
      frame = 0;
      started = true;
      schedule();
    });
  });
  onScopeDispose(() => {
    disposed = true;
    cancelAnimationFrame(frame);
    clearTimeout(timer);
    tasks.length = 0;
    isRendering.value = false;
  });

  return { isRendering, whenIdle };
}

export function useCommentRenderCompletion() {
  const rendering = inject(COMMENT_RENDERING_KEY, null);
  return async () => {
    await rendering?.whenIdle();
  };
}

/** Render fragment ancestors immediately; scrolling waits for the queue to settle. */
export function useProgressiveComments<T extends RenderableComment>(
  comments: () => T[],
  enabled: () => boolean = () => true,
) {
  const rendering = inject(COMMENT_RENDERING_KEY, null);
  const fragment = inject(COMMENT_FRAGMENT_STATE_KEY, null);
  if (!rendering) {
    return computed(comments);
  }

  const count = ref(0);
  const requiredCount = computed(() => {
    const nodes = comments();
    for (let index = nodes.length - 1; index >= 0; index -= 1) {
      const node = nodes[index];
      if (rendering.initialIds.has(node.id) || node.expandForHash || fragment?.hashPathIds.value.has(node.id)) {
        return index + 1;
      }
    }
    return 0;
  });

  watch([comments, enabled, requiredCount], ([nodes, isEnabled, required], _previous, onCleanup) => {
    // Retain comments revealed by an earlier fragment after the hash changes.
    count.value = Math.max(count.value, required);
    if (!isEnabled || count.value >= nodes.length) {
      return;
    }
    onCleanup(rendering.enqueue(() => {
      count.value = Math.min(nodes.length, Math.max(count.value, requiredCount.value) + 1);
      return count.value < nodes.length;
    }));
  }, { immediate: true });

  return computed(() => comments().slice(0, Math.max(count.value, requiredCount.value)));
}
