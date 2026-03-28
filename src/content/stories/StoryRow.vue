<script setup lang="ts">
import type { Story } from '@/parsers/storyList';
import StoryRank from './StoryRank.vue';
import StoryMeta from './StoryMeta.vue';
import VoteButton from '@/content/shared/VoteButton.vue';
import Badge from '@/content/shared/Badge.vue';

defineProps<{ story: Story }>();
</script>

<template>
  <article class="story-row">
    <StoryRank :rank="story.rank" />
    <VoteButton :href="story.voteUp" />
    <div class="story-row__body">
      <div class="story-row__title-line">
        <a
          :href="story.url ?? `item?id=${story.id}`"
          class="story-row__title"
        >{{ story.title }}</a>
        <Badge v-if="story.isDead" variant="dead" label="Dead" />
        <Badge v-if="story.isFlagged" variant="flagged" label="Flagged" />
        <Badge v-if="story.isJob" variant="job" label="Job" />
        <span v-if="story.site" class="story-row__site">
          (<a :href="`from?site=${story.site}`">{{ story.site }}</a>)
        </span>
      </div>
      <StoryMeta :story="story" />
    </div>
  </article>
</template>

<style scoped lang="scss">
.story-row {
  display: grid;
  grid-template-columns: 1.75rem 1.25rem 1fr;
  align-items: start;
  gap: 0 0.4rem;
  padding: 0.5rem 0.6rem 0.5rem 0;

  &:hover {
    background: color-mix(in srgb, var(--color-surface) 95%, var(--color-text) 5%);
  }

  &:not(:last-child) {
    border-bottom: 1px solid var(--color-border);
  }
}

.story-row__body {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
  min-width: 0;
}

.story-row__title-line {
  display: inline;
  line-height: 1.35;
}

.story-row__title {
  color: var(--color-text);
  font-family: var(--font-title);
  font-size: 1.02rem;
  font-weight: 600;

  &:visited {
    color: var(--color-text-muted);
  }

  &:hover {
    color: color-mix(in srgb, var(--color-text) 55%, var(--color-accent) 45%);
    text-decoration: none;
  }
}

.story-row__site {
  margin-left: 0.3rem;
  color: var(--color-text-muted);
  white-space: nowrap;
  font-size: 0.82rem;

  a {
    color: inherit;

    &:hover {
      color: var(--color-text);
    }
  }
}

@media (max-width: 640px) {
  .story-row {
    grid-template-columns: 1.5rem 1.1rem 1fr;
    gap: 0 0.3rem;
    padding: 0.5rem 0.6rem 0.5rem 0;
  }
}
</style>
