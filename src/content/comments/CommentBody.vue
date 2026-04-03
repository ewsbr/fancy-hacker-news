<script setup lang="ts">
import RichText from '@/content/shared/RichText.vue';

const props = defineProps<{
  html: string;
  grayLevel: string | null;
}>();

const isDownvoted = !!props.grayLevel && props.grayLevel !== 'c00';
</script>

<template>
  <div
    class="comment-body"
    :class="grayLevel && grayLevel !== 'c00' ? 'comment-body--downvoted' : 'comment-body--normal'"
    :tabindex="isDownvoted ? 0 : undefined"
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
    transition: opacity 0.2s ease, filter 0.2s ease, color 0.2s ease;
    cursor: pointer;

    &:is(:hover, :active, :focus-visible) {
      opacity: 1;
      filter: none;
      color: var(--color-text);
    }

    &:focus-visible {
      outline: 1px solid color-mix(in srgb, var(--color-accent) 45%, transparent);
      outline-offset: 3px;
    }
  }
}
</style>
