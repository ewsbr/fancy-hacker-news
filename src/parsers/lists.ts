/**
 * Parse the HN /lists page — a directory of special HN URLs.
 */

export interface ListEntry {
  name: string;
  href: string;
  descriptionHtml: string;
}

export interface ParsedListsPage {
  entries: ListEntry[];
}

export function parseListsPage(doc: Document): ParsedListsPage {
  const bigbox = doc.querySelector('#bigbox');
  if (!bigbox) return { entries: [] };

  const entries: ListEntry[] = [];

  for (const row of bigbox.querySelectorAll('tr')) {
    const cells = row.querySelectorAll('td');
    if (cells.length < 2) continue;

    const linkEl = cells[0].querySelector('a');
    if (!linkEl) continue;

    entries.push({
      name: linkEl.textContent?.trim() ?? '',
      href: linkEl.getAttribute('href') ?? '',
      descriptionHtml: cells[1].innerHTML.trim(),
    });
  }

  return { entries };
}
