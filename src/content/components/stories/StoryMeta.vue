<script setup lang="ts">
import type { Story } from '@/parsers/story-list';
import { computed } from 'vue';
import AuthorByline from '@/content/components/shared/AuthorByline.vue';
import InlineActionLink from '@/content/components/shared/InlineActionLink.vue';
import MetaSep from '@/content/components/ui/MetaSep.vue';
import { getToggleActionHref } from '@/parsers/shared/actions';

const props = defineProps<{ story: Story }>();

const ageLinkHref = computed(
  () => props.story.ageLink || props.story.commentLink || `item?id=${props.story.id}`,
);
const hideHref = computed(() => getToggleActionHref(props.story.hideAction));
</script>

<template>
  <div class="story-meta">
    <template v-if="!story.isJob && story.author !== null">
      <span v-if="story.score !== null" class="story-meta__score">
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
      <MetaSep v-if="hideHref" />
      <InlineActionLink
        v-if="hideHref"
        :href="hideHref"
        action="hide"
        :hide-target="story"
        class="story-meta__action"
      />
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
  &__action {
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
