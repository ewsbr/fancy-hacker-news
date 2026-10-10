/**
 * Parse the HN /lists page — a directory of special HN URLs.
 */

export interface ParsedListsPage {
  entries: { name: string; href: string; descriptionHtml: string }[];
}

export function parseListsPage(doc: Document): ParsedListsPage {
  const entries = Array.from(doc.querySelectorAll('#bigbox tr'), (row) => {
    const cells = row.querySelectorAll('td');
    const linkEl = cells[0]?.querySelector('a');
    return cells.length >= 2 && linkEl
      ? { name: linkEl.textContent!.trim(), href: linkEl.getAttribute('href') ?? '', descriptionHtml: cells[1].innerHTML.trim() }
      : null;
  }).filter(entry => entry !== null);

  return { entries };
}
