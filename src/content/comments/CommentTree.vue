<script setup lang="ts">
import type { CommentNode as CommentNodeType } from '@/parsers/item';
import CommentNode from './CommentNode.vue';
import LazyCommentRoot from './LazyCommentRoot.vue';

defineProps<{
  comments: CommentNodeType[];
}>();
</script>

<template>
  <div class="comment-tree">
    <component
      :is="comment.lazyThread ? LazyCommentRoot : CommentNode"
      v-for="comment in comments"
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
