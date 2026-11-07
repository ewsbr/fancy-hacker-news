export const RESPONSIVE_VIEWPORT_CONTENT = 'width=device-width, initial-scale=1.0';

// Content scripts at document_start run "before any other DOM is constructed", so document.head is still null and
// appending to it throws: https://developer.chrome.com/docs/extensions/reference/manifest/content-scripts#run_time
function getOrCreateHead(doc: Document): HTMLHeadElement {
  if (doc.head) {
    return doc.head;
  }

  const head = doc.createElement('head');
  doc.documentElement.insertBefore(head, doc.documentElement.firstChild);
  return head;
}

export function ensureResponsiveViewport(doc: Document): HTMLMetaElement {
  const existing = doc.querySelector<HTMLMetaElement>('meta[name="viewport" i]');
  if (existing) {
    return existing;
  }

  const viewport = doc.createElement('meta');
  viewport.name = 'viewport';
  viewport.content = RESPONSIVE_VIEWPORT_CONTENT;
  getOrCreateHead(doc).appendChild(viewport);
  return viewport;
}
