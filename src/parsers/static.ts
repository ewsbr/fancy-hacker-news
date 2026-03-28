/**
 * Parse HN static pages (/newsguidelines, /newsfaq, /formatdoc, /leaders, catch-all).
 */

export interface ParsedStaticPage {
  contentHtml: string;
}

export function parseStaticPage(doc: Document): ParsedStaticPage {
  const mainTable = doc.querySelector('table#hnmain');
  // Content lives in the last TD under hnmain > tbody > tr
  const tds = mainTable?.querySelectorAll(':scope > tbody > tr > td');
  const contentTd = tds && tds.length > 1 ? tds[tds.length - 1] : null;

  return {
    contentHtml: contentTd?.innerHTML ?? '',
  };
}
