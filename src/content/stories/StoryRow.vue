<script setup lang="ts">
import type { Story } from '@/parsers/storyList';
import StoryRank from './StoryRank.vue';
import StoryMeta from './StoryMeta.vue';
import VoteButton from '@/content/shared/VoteButton.vue';
import Badge from '@/content/shared/Badge.vue';
import StorySiteLink from '@/content/shared/StorySiteLink.vue';

defineProps<{ story: Story }>();
</script>

<template>
  <article class="story-row" :class="{ 'story-row--unranked': story.rank === null }">
    <StoryRank v-if="story.rank !== null" :rank="story.rank" />
    <VoteButton :href="story.voteUp" :vote-un-href="story.voteUn" :item-id="story.id" :vote-target="story" />
    <div class="story-row__body">
      <div class="story-row__title-line">
        <a
          :href="story.url ?? `item?id=${story.id}`"
          class="story-row__title"
          :class="{ 'story-row__title--dead': story.isDead }"
        >{{ story.title }}</a>
        <StorySiteLink :site="story.site" />
        <Badge v-if="story.isDead" variant="dead" label="Dead" />
        <Badge v-if="story.isFlagged" variant="flagged" label="Flagged" />
        <Badge v-if="story.isDeleted" variant="deleted" label="Deleted" />
        <Badge v-if="story.isJob" variant="job" label="Job" />
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
    background: var(--color-bg);
  }

  &:not(:last-child) {
    border-bottom: 1px solid var(--color-border);
  }

  &--unranked {
    grid-template-columns: 1.25rem 1fr;
    padding-left: 0.5rem;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    min-width: 0;
  }

  &__title-line {
    display: inline;
    line-height: 1.35;

    :deep(.badge) {
      margin-left: 0.35rem;
    }
  }

  &__title {
    color: var(--color-text);
    font-family: var(--font-title);
    font-size: 1.02rem;
    font-weight: 600;
    text-decoration: none;

    &:visited {
      color: var(--color-text-muted);
    }

    &--dead {
      text-decoration-line: line-through;
      text-decoration-thickness: 1.5px;
      text-decoration-color: currentColor;
      text-decoration-skip-ink: none;
    }
  }

  @media (max-width: 640px) {
    grid-template-columns: 1.5rem 1.1rem 1fr;
    gap: 0 0.3rem;
    padding: 0.5rem 0.375rem 0.5rem 0.375rem;

    &--unranked {
      grid-template-columns: 1.1rem 1fr;
      padding-left: 0.5rem;
    }
  }
}
</style>
