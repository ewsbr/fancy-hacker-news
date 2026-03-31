<script setup lang="ts">
import { inject } from 'vue';
import type { ParsedThreadsPage } from '@/parsers/threads';
import ThreadNode from '@/content/comments/ThreadNode.vue';
import Pagination from '@/content/shared/Pagination.vue';

const pageData = inject<ParsedThreadsPage>('pageData')!;
</script>

<template>
  <div class="threads-page">
    <div class="threads-page__container">
      <ThreadNode 
        v-for="thread in pageData.threads" 
        :key="thread.id" 
        :node="thread" 
      />
    </div>
    
    <Pagination :href="pageData.moreLink" />
  </div>
</template>

<style scoped lang="scss">
.threads-page {
  padding-bottom: 2rem;

  &__container {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-top: 3px solid var(--color-accent);
    border-radius: 4px;
    box-shadow: var(--shadow-elevation);
    overflow: hidden;
  }
}
</style>
