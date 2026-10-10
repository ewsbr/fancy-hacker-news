<script setup lang="ts">
import type { ThreadEntry } from '@/parsers/threads';
import CommentNode from './CommentNode.vue';

defineProps<{
  node: ThreadEntry;
}>();
</script>

<template>
  <CommentNode
    :node="node"
    :show-local-thread-author="true"
    :show-on-story="true"
    :enable-mobile-subthreads="false"
    root-variant="thread"
  />
</template>
