/**
 * Shared DOM-querying helpers used across all parsers.
 */

/** Safe textContent extraction. */
export const textOf = (el: Element | null | undefined): string =>
  el?.textContent?.trim() ?? '';

/** Safe getAttribute. */
export const attrOf = (el: Element | null | undefined, name: string): string | null =>
  el?.getAttribute(name) ?? null;

/** Extract href from an element. */
export const hrefOf = (el: Element | null | undefined): string | null =>
  attrOf(el, 'href');

/** "123 points" → 123 */
export function parseScore(text: string | null | undefined): number | null {
  const m = text?.match(/(\d+)\s+points?/);
  return m ? Number(m[1]) : null;
}

/** "45 comments" → 45, "discuss" → 0 */
export function parseCommentCount(text: string | null | undefined): number | null {
  if (!text) return null;
  const t = text.trim();
  if (t === 'discuss') return 0;
  const m = t.match(/(\d+)\s+comments?/);
  return m ? Number(m[1]) : null;
}

/** Checks for the green <font color="#3c963c"> inside a.hnuser. */
export function isNewUser(hnuserEl: Element | null | undefined): boolean {
  if (!hnuserEl) return false;
  return hnuserEl.querySelector('font[color="#3c963c"]') !== null;
}

export interface ParsedAge {
  text: string;
  timestamp: string;
  link: string;
}

/** Extract age text + ISO timestamp from span.age. */
export function parseAge(ageSpan: Element | null | undefined): ParsedAge {
  if (!ageSpan) return { text: '', timestamp: '', link: '' };
  const a = ageSpan.querySelector('a');
  return {
    text: textOf(a) || textOf(ageSpan),
    timestamp: attrOf(ageSpan, 'title') ?? '',
    link: hrefOf(a) ?? '',
  };
}

/** Find the "More" pagination link. */
export function findMoreLink(doc: Document): string | null {
  const more = doc.querySelector('a.morelink[href]') ?? doc.querySelector('a[rel="next"][href]');
  return more ? hrefOf(more) : null;
}

/** Extracts gray-level class (c00, c5a, etc.) from an element. */
export function parseGrayLevel(el: Element | null | undefined): string | null {
  if (!el) return null;
  const classes = Array.from(el.classList);
  const grayClass = classes.find(c => /^c[0-9a-fA-F]{2}$/.test(c));
  return grayClass?.toLowerCase() || null;
}

const QUOTED_HTML_PATTERN = /(^|<p\b[^>]*>)\s*(?:&gt;|>)/i;
const QUOTED_TEXT_PATTERN = /^\s*>\s?/;

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

function normalizeQuotedContent(container: Element, doc: Document): void {
  const nodes = Array.from(container.childNodes);
  const output: Node[] = [];
  const quoteParagraphs: Element[] = [];
  let i = 0;

  function flushQuotes() {
    if (!quoteParagraphs.length) return;
    const blockquote = doc.createElement('blockquote');
    for (const paragraph of quoteParagraphs) {
      blockquote.appendChild(paragraph);
    }
    output.push(blockquote);
    quoteParagraphs.length = 0;
  }

  while (i < nodes.length) {
    const node = nodes[i];

    if (node.nodeType === Node.TEXT_NODE && QUOTED_TEXT_PATTERN.test(node.textContent || '')) {
      const paragraph = doc.createElement('p');
      const stripped = (node.textContent || '').replace(QUOTED_TEXT_PATTERN, '');
      if (stripped) {
        paragraph.appendChild(doc.createTextNode(stripped));
      }
      i += 1;

      while (i < nodes.length && isInlineNode(nodes[i])) {
        paragraph.appendChild(nodes[i].cloneNode(true));
        i += 1;
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
        i += 1;
        continue;
      }
    }

    flushQuotes();
    output.push(node);
    i += 1;
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
