<script setup lang="ts">
import { inject } from 'vue';
import type { ParsedNewComments } from '@/parsers/newComments';
import FlatComment from '@/content/comments/FlatComment.vue';
import Pagination from '@/content/shared/Pagination.vue';

const pageData = inject<ParsedNewComments>('pageData')!;
</script>

<template>
  <div class="new-comments">
    <div class="new-comments__list">
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
  max-width: 900px;
  
  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  &__more {
    margin-top: 1.5rem;
  }
}
</style>
