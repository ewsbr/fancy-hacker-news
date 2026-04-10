<script setup lang="ts">
import { inject } from 'vue';
import type { ParsedThreadsPage } from '@/parsers/threads';
import ThreadNode from '@/content/components/comments/ThreadNode.vue';
import Pagination from '@/content/components/ui/Pagination.vue';
import { getThreadsEmptyMessage } from '@/content/utils/empty-states';

const pageData = inject<ParsedThreadsPage>('pageData')!;
const emptyMessage = getThreadsEmptyMessage(pageData.username);
</script>

<template>
  <div class="threads-page">
    <div v-if="pageData.threads.length" class="threads-page__card hn-content-card">
      <div class="threads-page__container">
        <ThreadNode 
          v-for="thread in pageData.threads" 
          :key="thread.id" 
          :node="thread" 
        />
      </div>

      <Pagination :href="pageData.moreLink" attached />
    </div>
    <div v-else class="threads-page__empty-state hn-content-card hn-empty-state">
      {{ emptyMessage }}
    </div>
  </div>
</template>

<style scoped lang="scss">
.threads-page {
  padding-bottom: 2rem;

  &__card {
    overflow: hidden;
  }

  &__container {
    background: var(--color-surface);
  }

  &__empty-state {
    border-radius: 4px;
  }
}
</style>
