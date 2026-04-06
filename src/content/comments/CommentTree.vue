<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue';
import type { CommentNode as CommentNodeType } from '@/parsers/item';
import CommentNode from './CommentNode.vue';
import { COMMENT_FRAGMENT_STATE_KEY, type CommentFragmentState } from '@/state/fragmentState';
import { INITIAL_RENDER_PAINTED_KEY } from '@/state/initialRender';
import { debugLog, recordBatchFrame } from '@/debug';
import {
  nextVisibleNodeCount,
  requiredVisibleNodeCount,
  ROOT_FRAME_RENDER_BUDGET,
  ROOT_INITIAL_RENDER_BUDGET,
  shouldProgressivelyRenderRoots,
} from './progressiveRender';

const props = defineProps<{
  comments: CommentNodeType[];
}>();

const fragmentState = inject<CommentFragmentState>(COMMENT_FRAGMENT_STATE_KEY, {
  hashPathIds: ref(new Set<string>()),
  hashTargetId: ref<string | null>(null),
  mainThreadHashTargetId: ref<string | null>(null),
});
const { hashPathIds } = fragmentState;
const initialRenderPainted = inject(INITIAL_RENDER_PAINTED_KEY, ref(true));

const totalCommentCount = computed(() =>
  props.comments.reduce((sum, comment) => sum + comment.descendantCount + 1, 0),
);
const shouldProgressivelyRender = computed(() => shouldProgressivelyRenderRoots(totalCommentCount.value));
const renderedRootCount = ref(props.comments.length);

let batchFrameId: number | null = null;

function requiredRootCount(): number {
  return requiredVisibleNodeCount(props.comments, hashPathIds.value);
}

function extendRenderedRoots(budget: number) {
  if (!shouldProgressivelyRender.value || renderedRootCount.value >= props.comments.length) {
    renderedRootCount.value = props.comments.length;
    return;
  }

  const nextCount = nextVisibleNodeCount(props.comments, renderedRootCount.value, budget);
  renderedRootCount.value = Math.min(
    props.comments.length,
    Math.max(nextCount, requiredRootCount()),
  );
}

function queueNextBatch() {
  if (
    !shouldProgressivelyRender.value
    || !initialRenderPainted.value
    || renderedRootCount.value >= props.comments.length
    || batchFrameId !== null
  ) {
    return;
  }

  batchFrameId = requestAnimationFrame(() => {
    batchFrameId = null;
    const beforeCount = renderedRootCount.value;
    const startedAt = performance.now();
    extendRenderedRoots(ROOT_FRAME_RENDER_BUDGET);
    recordBatchFrame('comments:root-batches', {
      durationMs: performance.now() - startedAt,
      beforeCount,
      afterCount: renderedRootCount.value,
      totalCount: props.comments.length,
    });
    queueNextBatch();
  });
}

if (shouldProgressivelyRender.value) {
  renderedRootCount.value = Math.min(
    props.comments.length,
    Math.max(nextVisibleNodeCount(props.comments, 0, ROOT_INITIAL_RENDER_BUDGET), requiredRootCount()),
  );
}

const visibleComments = computed(() =>
  shouldProgressivelyRender.value
    ? props.comments.slice(0, renderedRootCount.value)
    : props.comments,
);

watch(
  () => hashPathIds.value,
  () => {
    if (!shouldProgressivelyRender.value) {
      return;
    }

    const nextRequiredRootCount = requiredRootCount();
    if (nextRequiredRootCount > renderedRootCount.value) {
      renderedRootCount.value = nextRequiredRootCount;
    }

    queueNextBatch();
  },
);

onMounted(() => {
  if (shouldProgressivelyRender.value) {
    debugLog('comments:root-progressive-render-init', {
      totalCommentCount: totalCommentCount.value,
      initialRenderedRootCount: renderedRootCount.value,
      totalRootCount: props.comments.length,
      initialPaintComplete: initialRenderPainted.value,
    });
  }

  queueNextBatch();
});

watch(
  initialRenderPainted,
  painted => {
    if (!painted) {
      return;
    }

    queueNextBatch();
  },
  { immediate: true },
);

onUnmounted(() => {
  if (batchFrameId !== null) {
    cancelAnimationFrame(batchFrameId);
  }
});
</script>

<template>
  <div class="comment-tree">
    <CommentNode 
      v-for="comment in visibleComments" 
      :key="comment.id" 
      :node="comment" 
    />
  </div>
</template>

<style scoped lang="scss">
.comment-tree {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
</style>
