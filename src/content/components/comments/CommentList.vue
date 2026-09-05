<script setup lang="ts" generic="T extends CommentRenderableNode">
import type { CommentRenderableNode } from '@/content/composables/comment-node';
import { COMMENT_ROOT_GAP_PX } from '@/constants/comment-rendering';
import { useCommentPlaceholderHeight } from '@/content/composables/comment-placeholders';
import { useProgressiveComments } from '@/content/composables/comment-rendering';
import CommentPlaceholder from './CommentPlaceholder.vue';

const props = defineProps<{ comments: T[] }>();
const visibleComments = useProgressiveComments(() => props.comments);
const placeholderHeight = useCommentPlaceholderHeight(() => props.comments, () => visibleComments.value.length, 0, COMMENT_ROOT_GAP_PX);
</script>

<template>
  <slot :visible-comments="visibleComments" />
  <CommentPlaceholder :height="placeholderHeight" />
</template>
