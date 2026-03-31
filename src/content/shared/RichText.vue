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

const INLINE_TAGS = new Set(['I', 'B', 'EM', 'STRONG', 'A', 'CODE', 'SPAN', 'U', 'S', 'FONT']);

function isInlineNode(node: Node): boolean {
  if (node.nodeType === Node.TEXT_NODE) return true;
  if (node.nodeType === Node.ELEMENT_NODE) return INLINE_TAGS.has((node as Element).nodeName);
  return false;
}

function transformQuotes(html: string): string {
  const wrap = document.createElement('div');
  wrap.innerHTML = html;

  const nodes = Array.from(wrap.childNodes);
  const output: Node[] = [];
  const quoteParagraphs: Element[] = [];
  let i = 0;

  function flush() {
    if (!quoteParagraphs.length) return;
    const bq = document.createElement('blockquote');
    for (const p of quoteParagraphs) bq.appendChild(p);
    output.push(bq);
    quoteParagraphs.length = 0;
  }

  while (i < nodes.length) {
    const node = nodes[i];

    // Bare text node starting with > — absorb it plus any trailing inline siblings
    // into a single paragraph for the blockquote. Handles: >&gt;<i>text</i>
    if (node.nodeType === Node.TEXT_NODE && /^\s*>/.test(node.textContent || '')) {
      const p = document.createElement('p');
      const stripped = (node.textContent || '').replace(/^\s*>\s?/, '');
      if (stripped) p.appendChild(document.createTextNode(stripped));
      i++;
      while (i < nodes.length && isInlineNode(nodes[i])) {
        p.appendChild(nodes[i].cloneNode(true));
        i++;
      }
      quoteParagraphs.push(p);
      continue;
    }

    // <p> whose first text starts with >
    if (node.nodeName === 'P') {
      const el = node as Element;
      const first = getFirstLeafText(el);
      if (first && /^\s*>/.test(first.textContent || '')) {
        const clone = el.cloneNode(true) as Element;
        const cloneFirst = getFirstLeafText(clone)!;
        cloneFirst.textContent = (cloneFirst.textContent || '').replace(/^\s*>\s?/, '');
        quoteParagraphs.push(clone);
        i++;
        continue;
      }
    }

    flush();
    output.push(node);
    i++;
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
