export const EXTENSION_ROOT_ID = 'fancy-hn-root';
export const EXTENSION_ROOT_SELECTOR = `#${EXTENSION_ROOT_ID}`;

export function getExtensionRootHost(doc: Document = document): HTMLElement | null {
  return doc.getElementById(EXTENSION_ROOT_ID);
}
