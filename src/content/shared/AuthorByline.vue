<script setup lang="ts">
import Badge from '@/content/shared/Badge.vue';
import MetaSep from '@/content/shared/MetaSep.vue';

defineProps<{
  author: string;
  authorIsNew?: boolean;
  score?: number | null;
  ageLink: string;
  age: string;
  ageTimestamp?: string | null;
  prefix?: string;
}>();
</script>

<template>
  <span class="author-byline">
    <span v-if="prefix" class="author-byline__prefix">{{ prefix }}</span>
    <a :href="`user?id=${author}`" class="author-byline__author">{{ author }}</a>
    <Badge v-if="authorIsNew" variant="new" label="New" title="New user" />
    <template v-if="score != null">
      <MetaSep />
      <span class="author-byline__score">{{ score }} {{ score === 1 ? 'point' : 'points' }}</span>
    </template>
    <MetaSep />
    <a :href="ageLink" class="author-byline__age" :title="ageTimestamp ?? undefined">{{ age }}</a>
  </span>
</template>

<style scoped lang="scss">
.author-byline {
  display: contents;

  &__author {
    font-weight: 600;
    color: var(--color-text);
    text-decoration: none;

    &:hover {
      color: var(--color-accent);
      text-decoration: underline;
    }
  }

  &__age {
    color: inherit;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  &__score {
    color: inherit;
    font-weight: 500;
  }
}
</style>
