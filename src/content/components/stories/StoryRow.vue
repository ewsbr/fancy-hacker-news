<script setup lang="ts">
import type { Story } from '@/parsers/story-list';
import StoryRank from './StoryRank.vue';
import StoryMeta from './StoryMeta.vue';
import VoteButton from '@/content/components/stories/VoteButton.vue';
import Badge from '@/content/components/ui/Badge.vue';
import StorySiteLink from '@/content/components/stories/StorySiteLink.vue';

defineProps<{ story: Story }>();
</script>

<template>
  <article
    class="story-row"
    :class="{
      'story-row--unranked': story.rank === null,
      'story-row--wide-rank': story.rank !== null && story.rank >= 100,
    }"
  >
    <StoryRank v-if="story.rank !== null" :rank="story.rank" />
    <VoteButton class="story-row__vote" :href="story.voteUp" :vote-un-href="story.voteUn" :item-id="story.id" :vote-target="story" />
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
  grid-template-columns: 28px 20px 1fr;
  align-items: start;
  gap: 0 6px;
  padding: 8px 10px 8px 0;

  &:hover {
    background: var(--color-bg);
  }

  &:not(:last-child) {
    border-bottom: 1px solid var(--color-border);
  }

  &--unranked {
    grid-template-columns: 20px 1fr;
    padding-left: 8px;
  }

  &--wide-rank {
    grid-template-columns: 32px 20px 1fr;
    gap: 0 8px;
    padding-left: 4px;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  &__vote {
    margin-top: 5px;
  }

  &__title-line {
    display: inline;
    line-height: 1.35;

    :deep(.badge) {
      margin-left: 6px;
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
    grid-template-columns: 24px 18px 1fr;
    gap: 0 5px;
    padding: 8px 6px;

    &--unranked {
      grid-template-columns: 18px 1fr;
      padding-left: 8px;
    }

    &--wide-rank {
      grid-template-columns: 28px 18px 1fr;
      gap: 0 7px;
    }

    &__body {
      gap: 3px;
    }
  }
}
</style>
