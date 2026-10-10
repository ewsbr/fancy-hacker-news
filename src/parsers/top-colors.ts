/**
 * Parse the HN /topcolors page — a list of hex colors chosen by active users.
 */

export interface ParsedTopColorsPage {
  colors: string[];
}

export function parseTopColorsPage(doc: Document): ParsedTopColorsPage {
  const colors = Array.from(doc.querySelectorAll('#bigbox tr'), row => row.querySelector('td')?.textContent?.trim() ?? '')
    .filter(hex => /^#[0-9a-f]{6}$/i.test(hex))
    .map(hex => hex.toLowerCase());

  return { colors };
}
