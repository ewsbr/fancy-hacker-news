import { describe, expect, it } from 'vitest';
import {
  ensureResponsiveViewport,
  RESPONSIVE_VIEWPORT_CONTENT,
} from '@/content/utils/viewport';
import { parseHtmlDocument } from '../helpers/dom';

describe('viewport helpers', () => {
  it('adds a responsive viewport meta tag when the source page omits one', () => {
    const doc = parseHtmlDocument('<!doctype html><html><head><title>Legacy static page</title></head><body></body></html>');

    const viewport = ensureResponsiveViewport(doc);

    expect(viewport.getAttribute('name')).toBe('viewport');
    expect(viewport.getAttribute('content')).toBe(RESPONSIVE_VIEWPORT_CONTENT);
    expect(doc.head.querySelectorAll('meta[name="viewport"]')).toHaveLength(1);
  });

  it('preserves an existing viewport meta tag', () => {
    const doc = parseHtmlDocument(`
      <!doctype html>
      <html>
        <head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body></body>
      </html>
    `);
    const existing = doc.querySelector<HTMLMetaElement>('meta[name="viewport"]');

    const viewport = ensureResponsiveViewport(doc);

    expect(viewport).toBe(existing);
    expect(doc.head.querySelectorAll('meta[name="viewport"]')).toHaveLength(1);
  });
});
