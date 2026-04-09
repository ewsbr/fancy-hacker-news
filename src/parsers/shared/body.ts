import { textOf } from './dom';

export type CommentPlaceholderKind = 'flagged' | 'deleted';

export interface ParsedCommentBody {
  html: string;
  placeholderKind: CommentPlaceholderKind | null;
}

const QUOTED_HTML_PATTERN = /(^|<p\b[^>]*>)\s*(?:&gt;|>)/i;
const QUOTED_TEXT_PATTERN = /^\s*>\s?/;
const TEXT_NODE = 3;
const ELEMENT_NODE = 1;
const INLINE_TAGS = new Set(['I', 'B', 'EM', 'STRONG', 'A', 'CODE', 'SPAN', 'U', 'S', 'FONT']);

function detectCommentPlaceholder(text: string): CommentPlaceholderKind | null {
  const normalized = text.trim();
  if (normalized === '[flagged]') return 'flagged';
  if (normalized === '[deleted]') return 'deleted';
  return null;
}

function getFirstLeafText(node: Node): Text | null {
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === TEXT_NODE && (child.textContent || '').trim()) {
      return child as Text;
    }
    if (child.nodeType === ELEMENT_NODE) {
      const found = getFirstLeafText(child);
      if (found) return found;
    }
  }
  return null;
}

function isInlineNode(node: Node): boolean {
  if (node.nodeType === TEXT_NODE) return true;
  if (node.nodeType === ELEMENT_NODE) return INLINE_TAGS.has((node as Element).nodeName);
  return false;
}

function normalizeQuotedContent(container: Element, doc: Document): void {
  const nodes = Array.from(container.childNodes);
  const output: Node[] = [];
  const quoteParagraphs: Element[] = [];
  let index = 0;

  function flushQuotes() {
    if (!quoteParagraphs.length) return;
    const blockquote = doc.createElement('blockquote');
    for (const paragraph of quoteParagraphs) {
      blockquote.appendChild(paragraph);
    }
    output.push(blockquote);
    quoteParagraphs.length = 0;
  }

  while (index < nodes.length) {
    const node = nodes[index];

    if (node.nodeType === TEXT_NODE && QUOTED_TEXT_PATTERN.test(node.textContent || '')) {
      const paragraph = doc.createElement('p');
      const stripped = (node.textContent || '').replace(QUOTED_TEXT_PATTERN, '');
      if (stripped) {
        paragraph.appendChild(doc.createTextNode(stripped));
      }
      index += 1;

      while (index < nodes.length && isInlineNode(nodes[index])) {
        paragraph.appendChild(nodes[index].cloneNode(true));
        index += 1;
      }

      quoteParagraphs.push(paragraph);
      continue;
    }

    if (node.nodeName === 'P') {
      const paragraph = node as Element;
      const firstText = getFirstLeafText(paragraph);
      if (firstText && QUOTED_TEXT_PATTERN.test(firstText.textContent || '')) {
        const clone = paragraph.cloneNode(true) as Element;
        const cloneFirstText = getFirstLeafText(clone);
        if (cloneFirstText) {
          cloneFirstText.textContent = (cloneFirstText.textContent || '').replace(QUOTED_TEXT_PATTERN, '');
        }
        quoteParagraphs.push(clone);
        index += 1;
        continue;
      }
    }

    flushQuotes();
    output.push(node);
    index += 1;
  }

  flushQuotes();
  container.replaceChildren(...output);
}

export function extractRichTextHtml(source: Element | null | undefined): string {
  if (!source) return '';

  const clone = source.cloneNode(true) as Element;
  const html = clone.innerHTML;
  if (!html) {
    return '';
  }

  if (QUOTED_HTML_PATTERN.test(html)) {
    normalizeQuotedContent(clone, clone.ownerDocument);
  }

  return clone.innerHTML;
}

export function parseCommentBody(source: Element | null | undefined): ParsedCommentBody {
  if (!source) {
    return { html: '', placeholderKind: null };
  }

  if (source.classList.contains('comment')) {
    const richTextChild = Array.from(source.children).find(child => child.classList.contains('commtext')) ?? null;
    if (richTextChild) {
      const html = extractRichTextHtml(richTextChild);
      return {
        html,
        placeholderKind: detectCommentPlaceholder(textOf(richTextChild)),
      };
    }

    const clone = source.cloneNode(true) as Element;
    for (const reply of clone.querySelectorAll('.reply')) {
      reply.remove();
    }

    return {
      html: clone.innerHTML.trim(),
      placeholderKind: detectCommentPlaceholder(textOf(clone)),
    };
  }

  const html = extractRichTextHtml(source);
  return {
    html,
    placeholderKind: detectCommentPlaceholder(textOf(source)),
  };
}