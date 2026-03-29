<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  html: string;
}>();

const processedHtml = computed(() => {
  if (!props.html) return '';

  // Use a detached div fragment instead of DOMParser — fragment parsing is
  // significantly faster because it avoids allocating a full HTMLDocument.
  const tmp = document.createElement('div');
  tmp.innerHTML = props.html;

  tmp.querySelectorAll('pre').forEach(pre => {
    pre.classList.add('rich-text__pre');
  });

  tmp.querySelectorAll('p').forEach(p => {
    p.classList.add('rich-text__p');
    if (p.childNodes.length === 1 && p.firstElementChild?.tagName === 'I') {
      p.classList.add('rich-text__quote');
    }
  });

  tmp.querySelectorAll('a').forEach(a => {
    a.classList.add('rich-text__link');
    const href = a.getAttribute('href');
    if (href && !href.startsWith('item?id=') && !href.startsWith('user?id=') && !href.startsWith('reply?')) {
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'noopener noreferrer');
    }
  });

  return tmp.innerHTML;
});
</script>

<template>
  <div class="rich-text" v-html="processedHtml"></div>
</template>

<style scoped lang="scss">
.rich-text {
  font-size: 0.95rem;
  line-height: 1.6;
  word-break: break-word;

  :deep(.rich-text__p) {
    margin-top: 0.75rem;
    &:first-child {
      margin-top: 0;
    }
  }
  
  :deep(.rich-text__quote) {
    color: var(--color-muted);
    border-left: 2px solid var(--color-border);
    padding-left: 0.75rem;
    font-style: italic;
  }
  
  :deep(.rich-text__pre) {
    background: var(--color-code-bg);
    border: 1px solid var(--color-border);
    padding: 0.5rem 0.75rem;
    margin-top: 0.6rem;
    margin-bottom: 0.6rem;
    border-radius: 4px;
    overflow-x: auto;
    overflow-y: hidden;
    font-family: var(--font-mono);
    font-size: 0.825rem;
    line-height: 1.45;
    max-width: 100%;
    scrollbar-width: thin;
    scrollbar-color: var(--color-border) transparent;
    display: block;
  }
  
  :deep(.rich-text__link) {
    text-decoration: underline;
    &:hover {
      color: var(--color-accent);
    }
  }
}
</style>
