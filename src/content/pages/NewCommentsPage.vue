<script setup lang="ts">
import { inject } from 'vue';
import type { ParsedNewComments } from '@/parsers/newComments';
import FlatComment from '@/content/comments/FlatComment.vue';
import Pagination from '@/content/shared/Pagination.vue';
import TopNotice from '@/content/shared/TopNotice.vue';

const pageData = inject<ParsedNewComments>('pageData')!;
</script>

<template>
  <div class="new-comments">
    <TopNotice v-if="pageData.introHtml" :html="pageData.introHtml" />

    <div class="new-comments__list hn-content-card">
      <FlatComment 
        v-for="comment in pageData.comments" 
        :key="comment.id" 
        :comment="comment" 
      />
    </div>
    
    <div class="new-comments__more">
      <Pagination :href="pageData.moreLink" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.new-comments {
  padding-bottom: 2rem;
  max-width: 1024px;
  
  &__list {
    display: flex;
    flex-direction: column;
    border-radius: 4px 4px 0 0;
  }
  
  &__more {
    margin-top: 0;
  }
}
</style>
