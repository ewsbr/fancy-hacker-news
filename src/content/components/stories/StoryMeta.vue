<script setup lang="ts">
import { computed } from 'vue';
import type { Story } from '@/parsers/story-list';
import AuthorByline from '@/content/components/shared/AuthorByline.vue';
import MetaSep from '@/content/components/ui/MetaSep.vue';

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
  font-size: var(--hn-meta-font-size);
  line-height: var(--hn-meta-line-height);

  a {
    color: inherit;

    &:hover {
      text-decoration: underline;
    }
  }
  &__score {
    display: inline-flex;
    align-items: center;
    min-block-size: var(--hn-meta-row-height);
    color: var(--color-accent-muted);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }

  &__age,
  &__action,
  &__comments {
    display: inline-flex;
    align-items: center;
    min-block-size: var(--hn-meta-row-height);
    padding-inline: 0.12rem;
    vertical-align: middle;
  }

  &__age {
    color: inherit;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  &__comments {
    position: relative;
    font-weight: var(--hn-meta-action-font-weight);
    color: var(--color-text) !important;

    &::before {
      content: "";
      position: absolute;
      inset: -5px -4px;
    }
  }

  &__action {
    color: inherit;
    text-decoration: none;
    font-weight: var(--hn-meta-action-font-weight);

    &:hover {
      color: var(--color-text);
      text-decoration: underline;
    }
  }
}

@media (max-width: 640px) {
  .story-meta {
    margin-top: 0.1rem;
    row-gap: 0;
  }
}
</style>
