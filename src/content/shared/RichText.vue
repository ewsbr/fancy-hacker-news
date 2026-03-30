<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  html: string;
}>();

function getFirstLeafText(node: Node): Text | null {
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE && (child.textContent || '').trim()) {
      return child as Text;
    }
    if (child.nodeType === Node.ELEMENT_NODE) {
      const found = getFirstLeafText(child);
      if (found) return found;
    }
  }
  return null;
}

function transformQuotes(html: string): string {
  const wrap = document.createElement('div');
  wrap.innerHTML = html;

  const output: Node[] = [];
  const quoteParagraphs: Element[] = [];

  function flush() {
    if (!quoteParagraphs.length) return;
    const bq = document.createElement('blockquote');
    for (const p of quoteParagraphs) bq.appendChild(p);
    output.push(bq);
    quoteParagraphs.length = 0;
  }

  for (const node of Array.from(wrap.childNodes)) {
    let isQuote = false;

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (/^\s*>/.test(text)) {
        isQuote = true;
        const p = document.createElement('p');
        p.textContent = text.replace(/^\s*>\s?/, '');
        quoteParagraphs.push(p);
      }
    } else if (node.nodeName === 'P') {
      const el = node as Element;
      const first = getFirstLeafText(el);
      if (first && /^\s*>/.test(first.textContent || '')) {
        isQuote = true;
        const clone = el.cloneNode(true) as Element;
        const cloneFirst = getFirstLeafText(clone)!;
        cloneFirst.textContent = (cloneFirst.textContent || '').replace(/^\s*>\s?/, '');
        quoteParagraphs.push(clone);
      }
    }

    if (!isQuote) {
      flush();
      output.push(node);
    }
  }

  flush();
  wrap.replaceChildren(...output);
  return wrap.innerHTML;
}

const processedHtml = computed(() => transformQuotes(props.html));
</script>

<template>
  <div class="rich-text" v-html="processedHtml"></div>
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

  :deep(blockquote) {
    margin: 0.65rem 0;
    padding: 0.15rem 0.75rem;
    border-left: 3px solid var(--color-text-muted);
    background: var(--color-quote-bg);

    p {
      margin-top: 0.35rem;
      &:first-child {
        margin-top: 0;
      }
    }
  }
}
</style>
