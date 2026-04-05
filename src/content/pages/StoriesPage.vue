<script setup lang="ts">
import { inject } from 'vue';
import type { RouteDescriptor } from '@/router';
import type { ParsedStoryList } from '@/parsers/storyList';
import StoryRow from '@/content/stories/StoryRow.vue';
import Pagination from '@/content/shared/Pagination.vue';
import TopNotice from '@/content/shared/TopNotice.vue';
import UserCollectionHeader from '@/content/shared/UserCollectionHeader.vue';
import { getStoryListEmptyMessage } from '@/content/utils/emptyStates';
import { parseUserCollectionIntro } from '@/content/utils/userCollectionIntro';

const storyList = inject<ParsedStoryList>('pageData') as ParsedStoryList;
const route = inject<RouteDescriptor>('route')!;
const emptyMessage = getStoryListEmptyMessage(route);
const collectionIntro = parseUserCollectionIntro(storyList?.introHtml, document);
const activeCollectionKind = route.params.comments === 't' ? 'comments' : 'stories';
const showTopNotice = Boolean(storyList?.introHtml) && !collectionIntro;
const showListCard = Boolean(collectionIntro) || Boolean(storyList?.stories?.length);
const showFallbackMessage = !storyList?.stories?.length && !collectionIntro?.messages.length;
</script>

<template>
  <div class="stories-page">
    <TopNotice v-if="showTopNotice" :html="storyList.introHtml!" />

    <div v-if="showListCard" class="stories-page__list hn-content-card">
      <UserCollectionHeader
        v-if="collectionIntro"
        :intro="collectionIntro"
        :active-kind="activeCollectionKind"
      />

      <StoryRow
        v-for="story in storyList?.stories ?? []"
        :key="story.id"
        :story="story"
      />

      <div v-if="showFallbackMessage" class="stories-page__empty-copy hn-empty-state">
        {{ emptyMessage }}
      </div>
    </div>
    <div v-else class="stories-page__empty-state hn-content-card hn-empty-state">
      {{ emptyMessage }}
    </div>
    <Pagination :href="storyList?.moreLink ?? null" />
  </div>
</template>

<style scoped lang="scss">
.stories-page {
  &__list {
    border-radius: 4px 4px 0 0;
  }

  &__empty-state {
    border-radius: 4px;
  }

  &__empty-copy {
    border-top: 0;
  }
}
</style>
