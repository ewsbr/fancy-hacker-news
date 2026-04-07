/**
 * Parse HN static pages (/newsguidelines, /newsfaq, /formatdoc, /leaders, catch-all).
 */

export interface ParsedStaticPage {
  contentHtml: string;
}

const TEXT_NODE = 3;
const ELEMENT_NODE = 1;

function isStandaloneLegacyHeadingParagraph(paragraph: Element): boolean {
  let boldCount = 0;

  for (const node of Array.from(paragraph.childNodes)) {
    if (node.nodeType === TEXT_NODE) {
      if (node.textContent?.trim()) {
        return false;
      }
      continue;
    }

    if (node.nodeType !== ELEMENT_NODE) {
      return false;
    }

    const element = node as Element;
    if (element.tagName === 'BR') {
      continue;
    }

    if (element.tagName === 'B') {
      boldCount += 1;
      continue;
    }

    return false;
  }

  return boldCount === 1;
}

function extractBodyFallbackHtml(doc: Document): string {
  const body = doc.body;
  if (!body) {
    return '';
  }

  const clone = body.cloneNode(true) as HTMLElement;
  clone.querySelectorAll('script, style, link[rel="stylesheet"], noscript').forEach(el => el.remove());
  return clone.innerHTML.trim();
}

function normalizeBookmarkletMarkup(contentEl: Element): void {
  for (const link of Array.from(contentEl.querySelectorAll('a[href^="javascript:"]'))) {
    const href = link.getAttribute('href') ?? '';
    if (!href.includes('submitlink?u=')) {
      continue;
    }

    link.classList.add('hn-bookmarklet-link');
    link.removeAttribute('style');

    const centeredContainer = link.closest('center');
    if (centeredContainer) {
      centeredContainer.classList.add('hn-bookmarklet-cta');
    }
  }
}

/**
 * Normalize the content of older HN static pages (e.g. newsguidelines.html)
 * that use a legacy table layout with <b> tags as section headers.
 */
function normalizeLegacyHtml(contentEl: Element, doc: Document): string {
  const clone = contentEl.cloneNode(true) as Element;
  normalizeBookmarkletMarkup(clone);

  // Remove the YC banner image (the old pages had a 500px header image).
  clone.querySelector('a > img')?.parentElement?.remove();

  // Remove the decorative orange rule and the empty footer paragraph.
  for (const el of Array.from(clone.querySelectorAll('table[bgcolor], .foot'))) {
    el.remove();
  }

  // On legacy pages section headings are either bare <b> elements or
  // paragraphs that only contain a single <b>. Mixed-content paragraphs
  // like "<p><b>Missing From This List?</b> If you reported..." should
  // stay as paragraphs so trailing text is preserved.
  const headingSources = Array.from(clone.querySelectorAll('b, p')).filter(el => {
    if (el.tagName === 'P') {
      return isStandaloneLegacyHeadingParagraph(el);
    }

    return !el.closest('p');
  });

  // Promote the first heading to <h1> (page title) and the rest to <h2>.
  headingSources.forEach((source, i) => {
    const heading = doc.createElement(i === 0 ? 'h1' : 'h2');
    const sourceBold =
      source.tagName === 'P'
        ? Array.from(source.children).find(child => child.tagName === 'B') ?? source
        : source;

    if ((sourceBold as HTMLElement).id) {
      heading.id = (sourceBold as HTMLElement).id;
    }

    heading.textContent = sourceBold.textContent ?? '';
    source.replaceWith(heading);
  });

  // Strip remaining empty paragraphs (lone <br> or pure whitespace) left by the
  // old separator-style markup.
  for (const p of Array.from(clone.querySelectorAll('p'))) {
    if (!p.textContent?.trim() && !p.querySelector(':not(br)')) {
      p.remove();
    }
  }

  return clone.innerHTML;
}

export function parseStaticPage(doc: Document): ParsedStaticPage {
  const mainTable = doc.querySelector('table#hnmain');

  if (mainTable) {
    // Current HN format — content may live inside #bigbox.
    const bigboxTd = mainTable.querySelector('#bigbox > td');
    if (bigboxTd) {
      // Some pages (formatdoc, newsfaq) nest their text inside span.admin > table > td.
      const innerTd = bigboxTd.querySelector('span.admin td');
      const clone = (innerTd ?? bigboxTd).cloneNode(true) as Element;
      normalizeBookmarkletMarkup(clone);
      return { contentHtml: clone.innerHTML };
    }

    // Fallback: last TD in the hnmain rows (original behaviour).
    const tds = mainTable.querySelectorAll(':scope > tbody > tr > td, :scope > tr > td');
    const contentTd = tds.length > 1 ? tds[tds.length - 1] : null;
    if (!contentTd) {
      return { contentHtml: '' };
    }

    const clone = contentTd.cloneNode(true) as Element;
    normalizeBookmarkletMarkup(clone);
    return { contentHtml: clone.innerHTML };
  }

  // Legacy format (e.g. newsguidelines.html) — no #hnmain, plain center/table layout.
  // Browsers always insert an implicit <tbody>, so use a descendant selector.
  const legacyTd = doc.querySelector('body > center > table td');
  if (legacyTd) {
    return { contentHtml: normalizeLegacyHtml(legacyTd, doc) };
  }

  // Some utility endpoints such as delete-confirm can return a bare body
  // message or form instead of the normal HN table chrome.
  return { contentHtml: extractBodyFallbackHtml(doc) };
}
