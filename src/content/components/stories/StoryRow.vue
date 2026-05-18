<script setup lang="ts">
import type { Story } from '@/parsers/story-list';
import { computed } from 'vue';
import StorySiteLink from '@/content/components/stories/StorySiteLink.vue';
import VoteButton from '@/content/components/stories/VoteButton.vue';
import Badge from '@/content/components/ui/Badge.vue';
import { splitTrailingWord } from '@/content/utils/text';
import StoryMeta from './StoryMeta.vue';
import StoryRank from './StoryRank.vue';
import CommentIcon from '~icons/material-symbols/chat-sharp';

const props = defineProps<{ story: Story }>();

const jobTitleParts = computed(() => splitTrailingWord(props.story.title));
const showCommentRail = computed(() => !props.story.isJob);
const commentRailHref = computed(() => props.story.commentLink || props.story.ageLink || `item?id=${props.story.id}`);
const commentRailCount = computed(() => props.story.commentCount ?? 0);
</script>

<template>
  <article
    class="story-row"
    :class="{
      'story-row--unranked': story.rank === null,
      'story-row--wide-rank': story.rank !== null && story.rank >= 100,
      'story-row--comments-aside': showCommentRail,
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
        >
          <template v-if="story.isJob">
            {{ jobTitleParts.lead }}<span class="story-row__job-link-wrap">{{ jobTitleParts.tail }}<Badge variant="job" label="Job" /></span>
          </template>
          <template v-else>{{ story.title }}</template>
        </a>
        <StorySiteLink :site="story.site" />
        <Badge v-if="story.isDead" variant="dead" label="Dead" />
        <Badge v-if="story.isFlagged" variant="flagged" label="Flagged" />
        <Badge v-if="story.isDeleted" variant="deleted" label="Deleted" />
      </div>
      <StoryMeta :story="story" />
    </div>
    <a
      v-if="showCommentRail"
      :href="commentRailHref"
      class="story-row__comments"
      :aria-label="`${commentRailCount} comments on ${story.title}`"
    >
      <CommentIcon class="story-row__comments-icon" aria-hidden="true" />
      <span class="story-row__comments-count">{{ commentRailCount }}</span>
    </a>
  </article>
</template>

<style scoped lang="scss">
.story-row {
  display: grid;
  grid-template-columns: 28px 20px 1fr;
  align-items: start;
  gap: 0 4px;
  padding: 8px 10px 8px 6px;

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

  &--comments-aside {
    grid-template-columns: 28px 20px minmax(0, 1fr) 44px;
    padding-right: 6px;

    &.story-row--unranked {
      grid-template-columns: 20px minmax(0, 1fr) 44px;
    }

    &.story-row--wide-rank {
      grid-template-columns: 32px 20px minmax(0, 1fr) 44px;
    }
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

  &__job-link-wrap {
    white-space: nowrap;
  }

  &__comments {
    align-self: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-items: center;
    gap: 4px;
    min-width: 40px;
    min-height: 40px;
    padding: 4px 0;
    color: var(--color-text-muted);
    text-decoration: none;
    font-weight: 800;
    font-variant-numeric: tabular-nums;

    &:hover {
      color: var(--color-accent-muted);
      text-decoration: none;
    }
  }

  &__comments-icon {
    width: 24px;
    height: 24px;
    transform: scale(-1, 1);
  }

  &__comments-count {
    font-size: 0.78rem;
    line-height: 1;
  }
}

@media (max-width: 640px) {
  .story-row {
    &--comments-aside {
      grid-template-columns: 24px 18px minmax(0, 1fr) 36px;

      &.story-row--unranked {
        grid-template-columns: 18px minmax(0, 1fr) 36px;
      }

      &.story-row--wide-rank {
        grid-template-columns: 30px 18px minmax(0, 1fr) 36px;
      }
    }

    &__comments {
      min-width: 34px;
    }
  }
}
</style>
