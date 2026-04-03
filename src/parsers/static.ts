/**
 * Parse HN static pages (/newsguidelines, /newsfaq, /formatdoc, /leaders, catch-all).
 */

export interface ParsedStaticPage {
  contentHtml: string;
}

/**
 * Normalize the content of older HN static pages (e.g. newsguidelines.html)
 * that use a legacy table layout with <b> tags as section headers.
 */
function normalizeLegacyHtml(contentEl: Element, doc: Document): string {
  const clone = contentEl.cloneNode(true) as Element;

  // Remove the YC banner image (the old pages had a 500px header image).
  clone.querySelector('a > img')?.parentElement?.remove();

  // Remove the decorative orange rule and the empty footer paragraph.
  for (const el of Array.from(clone.querySelectorAll('table[bgcolor], .foot'))) {
    el.remove();
  }

  // On legacy pages all section headings are bare <b> elements.
  // Promote the first to <h1> (page title) and the rest to <h2>.
  const bolds = Array.from(clone.querySelectorAll('b'));
  bolds.forEach((b, i) => {
    const heading = doc.createElement(i === 0 ? 'h1' : 'h2');
    if ((b as HTMLElement).id) heading.id = (b as HTMLElement).id;
    heading.textContent = b.textContent ?? '';
    b.replaceWith(heading);
  });

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
      return { contentHtml: (innerTd ?? bigboxTd).innerHTML };
    }

    // Fallback: last TD in the hnmain rows (original behaviour).
    const tds = mainTable.querySelectorAll(':scope > tbody > tr > td, :scope > tr > td');
    const contentTd = tds.length > 1 ? tds[tds.length - 1] : null;
    return { contentHtml: contentTd?.innerHTML ?? '' };
  }

  // Legacy format (e.g. newsguidelines.html) — no #hnmain, plain center/table layout.
  // Browsers always insert an implicit <tbody>, so use a descendant selector.
  const legacyTd = doc.querySelector('body > center > table td');
  if (legacyTd) {
    return { contentHtml: normalizeLegacyHtml(legacyTd, doc) };
  }

  return { contentHtml: '' };
}
