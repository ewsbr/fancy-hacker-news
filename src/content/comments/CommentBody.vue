<script setup lang="ts">
import RichText from '@/content/shared/RichText.vue';

defineProps<{
  html: string;
  grayLevel: string | null;
}>();
</script>

<template>
  <div
    class="comment-body"
    :class="grayLevel && grayLevel !== 'c00' ? 'comment-body--downvoted' : 'comment-body--normal'"
  >
    <RichText v-once :html="html" />
  </div>
</template>

<style scoped lang="scss">
.comment-body {
  transition: opacity 0.2s ease, filter 0.2s ease;
  line-height: 1.6;
  font-size: 0.95rem;

  &--normal {
    color: var(--color-text);
  }

  &--downvoted {
    opacity: 0.85;
    filter: grayscale(10%);
    color: var(--color-text-muted);
  }
}
</style>
