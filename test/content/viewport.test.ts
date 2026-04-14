import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import {
  ensureResponsiveViewport,
  RESPONSIVE_VIEWPORT_CONTENT,
} from '@/content/utils/viewport';

describe('viewport helpers', () => {
  it('adds a responsive viewport meta tag when the source page omits one', () => {
    const dom = new JSDOM('<!doctype html><html><head><title>Legacy static page</title></head><body></body></html>');

    const viewport = ensureResponsiveViewport(dom.window.document);

    expect(viewport.getAttribute('name')).toBe('viewport');
    expect(viewport.getAttribute('content')).toBe(RESPONSIVE_VIEWPORT_CONTENT);
    expect(dom.window.document.head.querySelectorAll('meta[name="viewport"]')).toHaveLength(1);
  });

  it('preserves an existing viewport meta tag', () => {
    const dom = new JSDOM(`
      <!doctype html>
      <html>
        <head><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body></body>
      </html>
    `);
    const existing = dom.window.document.querySelector<HTMLMetaElement>('meta[name="viewport"]');

    const viewport = ensureResponsiveViewport(dom.window.document);

    expect(viewport).toBe(existing);
    expect(dom.window.document.head.querySelectorAll('meta[name="viewport"]')).toHaveLength(1);
  });
});
