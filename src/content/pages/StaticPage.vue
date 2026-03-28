<script setup lang="ts">
import { inject } from 'vue';
import type { ParsedStaticPage } from '@/parsers/static';

const page = inject<ParsedStaticPage>('pageData')!;
</script>

<template>
  <div class="py-8">
    <div
      v-if="page.contentHtml"
      class="prose max-w-none text-text [&_a]:text-accent [&_a:hover]:underline [&_p]:mb-3 [&_h1]:font-title [&_h1]:text-lg [&_h1]:font-semibold [&_h1]:mb-4 [&_h2]:font-title [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-3 [&_li]:mb-1 [&_pre]:rich-text-pre [&_code]:font-mono [&_code]:text-sm"
      v-html="page.contentHtml"
    />
    <p v-else class="text-muted text-sm">No content found.</p>
  </div>
</template>
