import { describe, expect, it, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { parseLoginPage } from '@/parsers/login';

describe('login page parser', () => {
  it('parses bare auth-gate messages from the source body', () => {
    const dom = new JSDOM(`
      <html>
        <body>
          Please log in.<br><br>
          <center><a href="login?goto=news">login</a></center>
        </body>
      </html>
    `, {
      url: 'https://news.ycombinator.com/fave?id=42009039',
    });

    vi.stubGlobal('location', dom.window.location);
    try {
      const page = parseLoginPage(dom.window.document);

      expect(page.variant).toBe('auth-gate');
      expect(page.title).toBe('Please log in.');
      expect(page.authMessage).toBe('Please log in.');
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
