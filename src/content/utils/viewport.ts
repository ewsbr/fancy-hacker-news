export const RESPONSIVE_VIEWPORT_CONTENT = 'width=device-width, initial-scale=1.0';

function findViewportMeta(doc: Document): HTMLMetaElement | null {
  return Array.from(doc.getElementsByTagName('meta'))
    .find(meta => meta.getAttribute('name')?.toLowerCase() === 'viewport') ?? null;
}

function getOrCreateHead(doc: Document): HTMLHeadElement {
  if (doc.head) {
    return doc.head;
  }

  const head = doc.createElement('head');
  doc.documentElement.insertBefore(head, doc.documentElement.firstChild);
  return head;
}

export function ensureResponsiveViewport(doc: Document): HTMLMetaElement {
  const existing = findViewportMeta(doc);
  if (existing) {
    return existing;
  }

  const viewport = doc.createElement('meta');
  viewport.name = 'viewport';
  viewport.content = RESPONSIVE_VIEWPORT_CONTENT;
  getOrCreateHead(doc).appendChild(viewport);
  return viewport;
}
