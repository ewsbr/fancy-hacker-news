<script setup lang="ts">
import { computed } from 'vue';
import type { Story } from '@/parsers/storyList';
import Badge from '@/content/shared/Badge.vue';

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
      <span class="story-meta__by">by</span>
      <a
        :href="`user?id=${story.author}`"
        class="story-meta__author"
      >{{ story.author }}</a>
      <Badge v-if="story.authorIsNew" variant="new" label="New" title="New user" />
    </template>
    <a :href="ageLinkHref" class="story-meta__age">{{ story.age }}</a>
    <template v-if="!story.isJob">
      <span class="story-meta__sep" aria-hidden="true">|</span>
      <a v-if="story.hideUrl" :href="story.hideUrl" class="story-meta__action">hide</a>
      <span v-if="story.hideUrl" class="story-meta__sep" aria-hidden="true">|</span>
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
  color: var(--color-accent);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.story-meta__author {
  font-weight: 600;
  color: var(--color-text);
}

.story-meta__sep {
  color: var(--color-border);
  font-weight: 700;
  user-select: none;
}

.story-meta__comments {
  font-weight: 600;
  color: var(--color-text) !important;
}

.story-meta__action {
  &:hover {
    color: var(--color-text);
  }
}
</style>
