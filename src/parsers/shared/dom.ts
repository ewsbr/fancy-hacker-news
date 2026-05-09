/**
 * Low-level DOM-querying helpers shared across all parsers.
 */

/** Safe textContent extraction. */
export function textOf(el: Element | null | undefined): string {
  return el?.textContent?.trim() ?? '';
}

/** Safe getAttribute. */
export function attrOf(el: Element | null | undefined, name: string): string | null {
  return el?.getAttribute(name) ?? null;
}

/** Extract href from an element. */
export function hrefOf(el: Element | null | undefined): string | null {
  return attrOf(el, 'href');
}
