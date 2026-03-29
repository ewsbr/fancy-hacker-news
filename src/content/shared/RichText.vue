<script setup lang="ts">
defineProps<{
  html: string;
}>();

function onClick(event: MouseEvent) {
  if (event.defaultPrevented || event.button !== 0) {
    return;
  }

  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }

  const target = event.target;
  if (!(target instanceof Element)) {
    return;
  }

  const anchor = target.closest('a');
  if (!(anchor instanceof HTMLAnchorElement)) {
    return;
  }

  const href = anchor.getAttribute('href');
  if (!href) {
    return;
  }

  if (href.startsWith('item?id=') || href.startsWith('user?id=') || href.startsWith('reply?')) {
    return;
  }

  event.preventDefault();
  window.open(anchor.href, '_blank', 'noopener,noreferrer');
}
</script>

<template>
  <div class="rich-text" v-html="html" @click="onClick"></div>
</template>

<style scoped lang="scss">
.rich-text {
  font-size: 0.95rem;
  line-height: 1.6;
  word-break: break-word;

  :deep(p) {
    margin-top: 0.75rem;
    &:first-child {
      margin-top: 0;
    }
  }

  :deep(p:has(> i:only-child)) {
    color: var(--color-muted);
    border-left: 2px solid var(--color-border);
    padding-left: 0.75rem;
    font-style: italic;
  }

  :deep(pre) {
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

  :deep(a) {
    text-decoration: underline;
    &:hover {
      color: var(--color-accent);
    }
  }
}
</style>
