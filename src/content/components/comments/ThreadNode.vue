<script setup lang="ts">
import type { ThreadEntry } from '@/parsers/threads';
import CommentNode from './CommentNode.vue';

defineProps<{
  node: ThreadEntry;
  threadAuthor?: string | null;
  parentAuthor?: string | null;
}>();
</script>

<template>
  <CommentNode
    :node="node"
    :thread-author="threadAuthor"
    :parent-author="parentAuthor"
    :show-local-thread-author="true"
    :show-on-story="true"
    :enable-mobile-subthreads="false"
    root-variant="thread"
  />
</template>
