<script setup lang="ts">
import { inject } from 'vue';
import type { RouteDescriptor } from '@/router';
import type { ParsedNewComments } from '@/parsers/new-comments';
import FlatComment from '@/content/components/comments/FlatComment.vue';
import Pagination from '@/content/components/ui/Pagination.vue';
import TopNotice from '@/content/components/shared/TopNotice.vue';
import UserCollectionHeader from '@/content/components/shared/UserCollectionHeader.vue';
import { getCommentListEmptyMessage } from '@/content/utils/empty-states';
import { parseUserCollectionIntro } from '@/content/utils/user-collection-intro';

const pageData = inject<ParsedNewComments>('pageData')!;
const route = inject<RouteDescriptor>('route')!;
const emptyMessage = getCommentListEmptyMessage(route);
const collectionIntro = parseUserCollectionIntro(pageData.introHtml, document);
const activeCollectionKind = route.params.comments === 't' ? 'comments' : 'stories';
const showTopNotice = Boolean(pageData.introHtml) && !collectionIntro;
const showListCard = Boolean(collectionIntro) || pageData.comments.length > 0;
const showFallbackMessage = pageData.comments.length === 0 && !collectionIntro?.messages.length;
</script>

<template>
  <div class="new-comments">
    <TopNotice v-if="showTopNotice" :html="pageData.introHtml!" />

    <div v-if="showListCard" class="new-comments__card hn-content-card">
      <div class="new-comments__list">
        <UserCollectionHeader
          v-if="collectionIntro"
          :intro="collectionIntro"
          :active-kind="activeCollectionKind"
        />

        <FlatComment 
          v-for="comment in pageData.comments" 
          :key="comment.id" 
          :comment="comment" 
        />

        <div v-if="showFallbackMessage" class="new-comments__empty-copy hn-empty-state">
          {{ emptyMessage }}
        </div>
      </div>

      <Pagination :href="pageData.moreLink" attached />
    </div>
    <div v-else class="new-comments__empty-state hn-content-card hn-empty-state">
      {{ emptyMessage }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.new-comments {
  padding-bottom: 2rem;
  max-width: 1024px;

  &__card {
    overflow: hidden;
  }
  
  &__list {
    display: flex;
    flex-direction: column;
    background: var(--color-surface);
  }

  &__empty-state {
    border-radius: 4px;
  }

  &__empty-copy {
    border-top: 0;
  }
}
</style>
