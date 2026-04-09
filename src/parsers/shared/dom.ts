/**
 * Low-level DOM-querying helpers shared across all parsers.
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