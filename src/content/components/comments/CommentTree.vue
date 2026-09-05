<script setup lang="ts">
import type { CommentNode as CommentNodeType } from '@/parsers/item';
import type { ThreadEntry } from '@/parsers/threads';
import { computed, useTemplateRef } from 'vue';
import { COMMENT_ROOT_GAP_PX } from '@/constants/comment-rendering';
import {
  provideCommentActionStateRegistry,
  provideCommentCollapseRegistry,
  useDelegatedCommentLongPress,
} from '@/content/composables/comment-node';
import { provideCommentHeightEstimates } from '@/content/composables/comment-placeholders';
import { provideCommentRendering } from '@/content/composables/comment-rendering';
import { useExtensionSettings } from '@/state/settings-context';
import CommentList from './CommentList.vue';
import CommentNode from './CommentNode.vue';
import LazyCommentRoot from './LazyCommentRoot.vue';
import ThreadNode from './ThreadNode.vue';

const props = withDefaults(defineProps<{
  comments: Array<CommentNodeType | ThreadEntry>;
  variant?: 'item' | 'thread';
}>(), {
  variant: 'item',
});

const rootComponent = computed(() => (props.variant === 'thread' ? ThreadNode : CommentNode));
const treeRef = useTemplateRef('tree');
const settings = useExtensionSettings();
const estimateHeight = provideCommentHeightEstimates(treeRef, { enableMobileSubthreads: props.variant === 'item' });
const collapseRegistry = provideCommentCollapseRegistry(settings.features.longPressCommentCollapse);

provideCommentActionStateRegistry();
useDelegatedCommentLongPress(treeRef, collapseRegistry);

const { isRendering, whenIdle } = provideCommentRendering(props.comments);
defineExpose({ whenIdle });
</script>

<template>
  <div ref="tree" class="comment-tree" :aria-busy="isRendering" :style="{ gap: `${COMMENT_ROOT_GAP_PX}px` }">
    <CommentList v-slot="{ visibleComments }" :comments="comments">
      <component
        :is="variant === 'item' && comment.lazyThread ? LazyCommentRoot : rootComponent"
        v-for="comment in visibleComments"
        :key="comment.id"
        :node="comment"
        :style="{ '--comment-estimated-height': `${estimateHeight(comment)}px` }"
      />
    </CommentList>
  </div>
</template>

<style scoped lang="scss">
.comment-tree {
  display: flex;
  flex-direction: column;

  // Keep completed roots searchable while skipping offscreen layout and paint.
  :deep(> .comment-node),
  :deep(> .lazy-comment-root) {
    content-visibility: auto;
    contain-intrinsic-block-size: auto var(--comment-estimated-height);
    overflow-clip-margin: 12px;
  }
}
</style>
