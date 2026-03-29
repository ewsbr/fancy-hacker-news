<script setup lang="ts">
import { inject } from 'vue';
import type { RouteDescriptor } from '@/router';
import StoryRow from '@/content/stories/StoryRow.vue';
import FlatComment from '@/content/comments/FlatComment.vue';
import Pagination from '@/content/shared/Pagination.vue';

const route = inject<RouteDescriptor>('route')!;
// The pageData could be either story list or new comments depending on the router's parser.
// In main.ts, we need to decide which parser to use for `/favorites`.
const pageData = inject<any>('pageData');

const isComments = route.params.comments === 't';
</script>

<template>
  <div class="favorites-page">
    <template v-if="isComments && pageData && pageData.comments">
      <div class="favorites-page__comments-list">
        <FlatComment 
          v-for="comment in pageData.comments" 
          :key="comment.id" 
          :comment="comment" 
        />
      </div>
    </template>
    
    <template v-else-if="pageData && pageData.stories">
      <div class="favorites-page__stories-list">
        <StoryRow 
          v-for="story in pageData.stories" 
          :key="story.id" 
          :story="story" 
        />
      </div>
    </template>
    
    <div class="favorites-page__more" v-if="pageData && pageData.moreLink">
      <Pagination :href="pageData.moreLink" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.favorites-page {
  padding-bottom: 2rem;
  max-width: 900px;
  
  &__comments-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__stories-list {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    padding-bottom: 0.5rem;
  }
  
  &__more {
    margin-top: 1.5rem;
  }
}
</style>
