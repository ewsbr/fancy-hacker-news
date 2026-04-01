<script setup lang="ts">
import { inject } from 'vue';
import type { ParsedThreadsPage } from '@/parsers/threads';
import ThreadNode from '@/content/comments/ThreadNode.vue';
import Pagination from '@/content/shared/Pagination.vue';

const pageData = inject<ParsedThreadsPage>('pageData')!;
</script>

<template>
  <div class="threads-page">
      <div class="threads-page__container hn-content-card">
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
}
</style>
