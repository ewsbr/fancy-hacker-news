<script setup lang="ts">
import { computed } from 'vue';
import type { Story } from '@/parsers/storyList';
import AuthorByline from '@/content/shared/AuthorByline.vue';
import MetaSep from '@/content/shared/MetaSep.vue';

const props = defineProps<{ story: Story }>();

const ageLinkHref = computed(
  () => props.story.ageLink || props.story.commentLink || `item?id=${props.story.id}`,
);

function formatComments(count: number | null): string {
  if (count === null || count === 0) return 'discuss';
  return `${count} comment${count === 1 ? '' : 's'}`;
}
</script>

<template>
  <div class="story-meta">
    <template v-if="!story.isJob && story.author !== null">
      <span class="story-meta__score" v-if="story.score !== null">
        {{ story.score }} points
      </span>
      <AuthorByline
        prefix="by"
        :author="story.author!"
        :author-is-new="story.authorIsNew"
        :age-link="ageLinkHref"
        :age="story.age"
        :age-timestamp="story.ageTimestamp"
      />
    </template>
    <a v-else :href="ageLinkHref" class="story-meta__age">{{ story.age }}</a>
    <template v-if="!story.isJob">
      <MetaSep />
      <a v-if="story.hideUrl" :href="story.hideUrl" class="story-meta__action">hide</a>
      <MetaSep v-if="story.hideUrl" />
      <a
        v-if="story.commentLink"
        :href="story.commentLink"
        class="story-meta__comments"
      >{{ formatComments(story.commentCount) }}</a>
    </template>
  </div>
</template>

<style scoped lang="scss">
.story-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  column-gap: 0.4rem;
  row-gap: 0.1rem;
  color: var(--color-text-muted);
  font-size: 0.82rem;

  a {
    color: inherit;

    &:hover {
      text-decoration: underline;
    }
  }
}

.story-meta__score {
  color: var(--color-accent-muted);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.story-meta__age {
  color: inherit;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.story-meta__comments {
  position: relative;
  font-weight: 600;
  color: var(--color-text) !important;

  &::before {
    content: "";
    position: absolute;
    inset: -5px -4px;
  }
}

.story-meta__action {
  color: inherit;
  text-decoration: none;

  &:hover {
    color: var(--color-text);
    text-decoration: underline;
  }
}
</style>
