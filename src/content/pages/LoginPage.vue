<script setup lang="ts">
import { inject } from 'vue';
import type { ParsedLoginPage } from '@/parsers/login';

const page = inject<ParsedLoginPage>('pageData')!;
</script>

<template>
  <div class="py-8">
    <h1 class="text-xl font-title font-semibold mb-6">{{ page.title }}</h1>
    <form
      v-if="page.visibleFields.length"
      :action="page.formAction"
      :method="page.formMethod"
      class="bg-surface rounded-lg border border-border p-6 max-w-md space-y-4"
    >
      <input
        v-for="f in page.hiddenFields"
        :key="f.name"
        type="hidden"
        :name="f.name"
        :value="f.value"
      />
      <div v-for="field in page.visibleFields" :key="field.name" class="flex items-center gap-3">
        <label :for="`hn-${field.name}`" class="text-sm text-muted w-24 shrink-0 capitalize">{{ field.label }}</label>
        <input
          :id="`hn-${field.name}`"
          :type="field.type"
          :name="field.name"
          :defaultValue="field.value"
          class="border border-border rounded px-2 py-1 bg-bg text-text flex-1"
        />
      </div>
      <input
        type="submit"
        :value="page.submitLabel"
        class="bg-accent text-white font-semibold cursor-pointer border border-accent rounded px-4 py-1.5"
      />
    </form>
    <p v-else class="text-muted text-sm">No form found on this page.</p>
  </div>
</template>
