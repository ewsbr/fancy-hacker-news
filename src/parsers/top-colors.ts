/**
 * Parse the HN /topcolors page — a list of hex colors chosen by active users.
 */

export interface ParsedTopColorsPage {
  colors: string[];
}

const HEX_RE = /^#[0-9a-f]{6}$/i;

export function parseTopColorsPage(doc: Document): ParsedTopColorsPage {
  const bigbox = doc.querySelector('#bigbox');
  if (!bigbox) return { colors: [] };

  const colors: string[] = [];

  for (const row of bigbox.querySelectorAll('tr')) {
    const cell = row.querySelector('td');
    if (!cell) continue;

    const hex = cell.textContent?.trim() ?? '';
    if (HEX_RE.test(hex)) {
      colors.push(hex.toLowerCase());
    }
  }

  return { colors };
}
