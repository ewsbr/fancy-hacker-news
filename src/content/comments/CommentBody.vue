<script setup lang="ts">
import { Flag, Trash2 } from 'lucide-vue-next';
import RichText from '@/content/shared/RichText.vue';
import type { CommentPlaceholderKind } from '@/parsers/utils';

const props = defineProps<{
  html: string;
  grayLevel: string | null;
  placeholderKind?: CommentPlaceholderKind | null;
}>();

const isDownvoted = !!props.grayLevel && props.grayLevel !== 'c00';
</script>

<template>
  <div
    class="comment-body"
    :class="[
      grayLevel && grayLevel !== 'c00' ? 'comment-body--downvoted' : 'comment-body--normal',
      placeholderKind ? 'comment-body--placeholder' : '',
    ]"
    :tabindex="isDownvoted ? 0 : undefined"
  >
    <div v-if="placeholderKind" class="comment-body__placeholder">
      <Flag v-if="placeholderKind === 'flagged'" :size="15" class="comment-body__placeholder-icon" />
      <Trash2 v-else :size="15" class="comment-body__placeholder-icon" />
      <span class="comment-body__placeholder-label">[{{ placeholderKind }}]</span>
    </div>
    <RichText v-else v-once :html="html" />
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
      outline: 1px solid var(--color-focus-ring-strong);
      outline-offset: 3px;
    }
  }

  &--placeholder {
    opacity: 1;
    filter: none;
    cursor: default;
  }

  &__placeholder {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.15rem 0;
    color: var(--color-text-muted);
    font-style: italic;
  }

  &__placeholder-icon {
    flex: 0 0 auto;
    opacity: 0.7;
  }
}
</style>
