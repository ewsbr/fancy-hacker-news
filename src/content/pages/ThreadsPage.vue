<script setup lang="ts">
import type { ParsedThreadsPage } from '@/parsers/threads';
import { inject } from 'vue';
import CommentTree from '@/content/components/comments/CommentTree.vue';
import Pagination from '@/content/components/ui/Pagination.vue';
import { getThreadsEmptyMessage } from '@/content/utils/empty-states';

const pageData = inject<ParsedThreadsPage>('pageData')!;
const emptyMessage = getThreadsEmptyMessage(pageData.username);
</script>

<template>
  <div class="threads-page">
    <div v-if="pageData.threads.length" class="threads-page__card hn-content-card">
      <div class="threads-page__container">
        <CommentTree :comments="pageData.threads" variant="thread" />
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
  padding-bottom: 32px;

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
