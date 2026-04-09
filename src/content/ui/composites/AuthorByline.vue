<script setup lang="ts">
import Badge from '@/content/ui/primitives/Badge.vue';
import MetaSep from '@/content/ui/primitives/MetaSep.vue';

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
    display: inline-flex;
    align-items: center;
    min-block-size: 24px;
    padding-inline: 0.12rem;
    font-weight: 600;
    color: var(--color-text);
    text-decoration: none;
    vertical-align: middle;

    &:hover {
      color: var(--color-accent);
      text-decoration: underline;
    }
  }

  &__age {
    display: inline-flex;
    align-items: center;
    min-block-size: 24px;
    padding-inline: 0.12rem;
    color: inherit;
    text-decoration: none;
    vertical-align: middle;

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
