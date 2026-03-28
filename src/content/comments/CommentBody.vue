<script setup lang="ts">
import { computed } from 'vue';
import RichText from '@/content/shared/RichText.vue';

const props = defineProps<{
  html: string;
  grayLevel: string | null;
}>();

const classNames = computed(() => {
  if (!props.grayLevel || props.grayLevel === 'c00') return 'comment-body--normal';
  return 'comment-body--downvoted';
});
</script>

<template>
  <div :class="['comment-body', classNames]">
    <RichText :html="html" />
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
