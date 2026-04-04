<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue';
import type { CommentNode as CommentNodeType } from '@/parsers/item';
import CommentNode from './CommentNode.vue';
import { COMMENT_FRAGMENT_STATE_KEY, type CommentFragmentState } from './fragmentState';

const PROGRESSIVE_RENDER_THRESHOLD = 600;
const INITIAL_RENDER_BUDGET = 240;
const FRAME_RENDER_BUDGET = 400;

const props = defineProps<{
  comments: CommentNodeType[];
}>();

const fragmentState = inject<CommentFragmentState>(COMMENT_FRAGMENT_STATE_KEY, {
  hashPathIds: ref(new Set<string>()),
  hashTargetId: ref<string | null>(null),
  mainThreadHashTargetId: ref<string | null>(null),
});
const { hashPathIds } = fragmentState;

const totalCommentCount = computed(() =>
  props.comments.reduce((sum, comment) => sum + comment.descendantCount + 1, 0),
);
const shouldProgressivelyRender = computed(() => totalCommentCount.value > PROGRESSIVE_RENDER_THRESHOLD);
const renderedRootCount = ref(props.comments.length);

let batchFrameId: number | null = null;

function nextRootCount(startIndex: number, budget: number): number {
  let spent = 0;
  let nextIndex = startIndex;

  while (nextIndex < props.comments.length) {
    const root = props.comments[nextIndex];
    const cost = root.descendantCount + 1;

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

function requiredRootCount(): number {
  let requiredCount = 0;

  for (let index = 0; index < props.comments.length; index += 1) {
    const root = props.comments[index];
    if (root.expandForHash || hashPathIds.value.has(root.id)) {
      requiredCount = index + 1;
    }
  }

  return requiredCount;
}

function extendRenderedRoots(budget: number) {
  if (!shouldProgressivelyRender.value || renderedRootCount.value >= props.comments.length) {
    renderedRootCount.value = props.comments.length;
    return;
  }

  const nextCount = nextRootCount(renderedRootCount.value, budget);
  renderedRootCount.value = Math.min(
    props.comments.length,
    Math.max(nextCount, requiredRootCount()),
  );
}

function queueNextBatch() {
  if (!shouldProgressivelyRender.value || renderedRootCount.value >= props.comments.length || batchFrameId !== null) {
    return;
  }

  batchFrameId = requestAnimationFrame(() => {
    batchFrameId = null;
    extendRenderedRoots(FRAME_RENDER_BUDGET);
    queueNextBatch();
  });
}

if (shouldProgressivelyRender.value) {
  renderedRootCount.value = Math.min(
    props.comments.length,
    Math.max(nextRootCount(0, INITIAL_RENDER_BUDGET), requiredRootCount()),
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
  queueNextBatch();
});

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
  gap: 1rem;
}
</style>
