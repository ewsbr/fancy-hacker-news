<script setup lang="ts">
import { inject } from 'vue';
import type { ParsedSubmitPage } from '@/parsers/submit';
import SubmitForm from '@/content/forms/SubmitForm.vue';

const pageData = inject<ParsedSubmitPage>('pageData')!;
</script>

<template>
  <div class="submit-page">
    <template v-if="pageData.form">
      <SubmitForm :form="pageData.form" />
      
      <div class="submit-page__guidelines">
        Leave url blank to submit a question for discussion. If there
        is no url, text will appear at the top of the thread.<br><br>
        You can also submit via <a href="bookmarklet">bookmarklet</a>.
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
.submit-page {
  padding: 1rem 0;
  
  &__guidelines {
    max-width: 600px;
    margin-top: 2rem;
    padding-left: 6rem;
    font-size: 0.85rem;
    color: var(--color-text-muted);
    line-height: 1.5;
    
    a {
      color: var(--color-text-muted);
      text-decoration: underline;
      
      &:hover {
        color: var(--color-text);
      }
    }
  }
}
</style>
