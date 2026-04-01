<script setup lang="ts">
import { inject } from 'vue';
import type { ParsedStoryList } from '@/parsers/storyList';
import StoryRow from '@/content/stories/StoryRow.vue';
import Pagination from '@/content/shared/Pagination.vue';

const storyList = inject<ParsedStoryList>('pageData') as ParsedStoryList;
</script>

<template>
  <div class="stories-page">
    <div class="stories-page__list hn-content-card">
      <StoryRow
        v-for="story in storyList?.stories ?? []"
        :key="story.id"
        :story="story"
      />
    </div>
    <Pagination :href="storyList?.moreLink ?? null" />
  </div>
</template>

<style scoped lang="scss">
.stories-page {
  &__list {
    border-radius: 4px 4px 0 0;
  }
}
</style>
