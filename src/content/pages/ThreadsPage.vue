<script setup lang="ts">
import { inject } from 'vue';
import type { ParsedThreadsPage } from '@/parsers/threads';
import ThreadNode from '@/content/comments/ThreadNode.vue';
import Pagination from '@/content/shared/Pagination.vue';

const pageData = inject<ParsedThreadsPage>('pageData')!;
</script>

<template>
  <div class="threads-page">
    <div class="threads-page__list">
      <ThreadNode 
        v-for="thread in pageData.threads" 
        :key="thread.id" 
        :node="thread" 
      />
    </div>
    
    <div class="threads-page__more">
      <Pagination :href="pageData.moreLink" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.threads-page {
  padding-bottom: 2rem;
  max-width: 900px;
  
  &__list {
    display: flex;
    flex-direction: column;
    /* Extra spacing between root threads */
    gap: 1.5rem;
  }
  
  &__more {
    margin-top: 2rem;
    padding-left: 20px;
  }
}
</style>
