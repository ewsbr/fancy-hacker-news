<script setup lang="ts">
import type { CommentNode as CommentNodeType } from '@/parsers/item';
import type { ThreadEntry } from '@/parsers/threads';
import { computed, useTemplateRef } from 'vue';
import {
  provideCommentActionStateRegistry,
  provideCommentCollapseRegistry,
  useDelegatedCommentLongPress,
} from '@/content/composables/comment-node';
import { useExtensionSettings } from '@/state/settings-context';
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
const collapseRegistry = provideCommentCollapseRegistry(settings.features.longPressCommentCollapse);

provideCommentActionStateRegistry();
useDelegatedCommentLongPress(treeRef, collapseRegistry);
</script>

<template>
  <div ref="tree" class="comment-tree">
    <component
      :is="variant === 'item' && comment.lazyThread ? LazyCommentRoot : rootComponent"
      v-for="comment in comments"
      :key="comment.id"
      :node="comment"
    />
  </div>
</template>

<style scoped lang="scss">
.comment-tree {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
