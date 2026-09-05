<script setup lang="ts" generic="T extends CommentRenderableNode">
import type { CommentRenderableNode } from '@/content/composables/comment-node';
import { useProgressiveComments } from '@/content/composables/comment-rendering';

const props = defineProps<{ comments: T[] }>();
const visibleComments = useProgressiveComments(() => props.comments);
</script>

<template>
  <slot :visible-comments="visibleComments" />
</template>
