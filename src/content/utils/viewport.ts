export const RESPONSIVE_VIEWPORT_CONTENT = 'width=device-width, initial-scale=1.0';

export function ensureResponsiveViewport(doc: Document): HTMLMetaElement {
  const existing = doc.querySelector<HTMLMetaElement>('meta[name="viewport" i]');
  if (existing) {
    return existing;
  }

  const viewport = doc.createElement('meta');
  viewport.name = 'viewport';
  viewport.content = RESPONSIVE_VIEWPORT_CONTENT;
  doc.head.appendChild(viewport);
  return viewport;
}
