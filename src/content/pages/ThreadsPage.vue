<script setup lang="ts">
import { inject } from 'vue';
import type { ParsedThreadsPage } from '@/parsers/threads';
import ThreadNode from '@/content/comments/ThreadNode.vue';
import Pagination from '@/content/shared/Pagination.vue';
import { getThreadsEmptyMessage } from '@/content/utils/emptyStates';

const pageData = inject<ParsedThreadsPage>('pageData')!;
const emptyMessage = getThreadsEmptyMessage(pageData.username);
</script>

<template>
  <div class="threads-page">
    <div v-if="pageData.threads.length" class="threads-page__container hn-content-card">
      <ThreadNode 
        v-for="thread in pageData.threads" 
        :key="thread.id" 
        :node="thread" 
      />
    </div>
    <div v-else class="threads-page__empty-state hn-content-card hn-empty-state">
      {{ emptyMessage }}
    </div>
    
    <Pagination :href="pageData.moreLink" />
  </div>
</template>

<style scoped lang="scss">
.threads-page {
  padding-bottom: 2rem;

  &__container {
    border-radius: 4px 4px 0 0;
  }

  &__empty-state {
    border-radius: 4px;
  }
}
</style>
