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
