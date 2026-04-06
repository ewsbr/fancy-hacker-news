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

  it('parses reply auth-gate messages from the source body', () => {
    const dom = new JSDOM(`
      <html>
        <body>
          You have to be logged in to reply.<br><br>
          <center>
            <form action="login" method="post">
              <input type="hidden" name="goto" value="reply?id=47633987&amp;goto=item%3Fid%3D47633396%2347633987">
              <input type="text" name="acct">
              <input type="password" name="pw">
              <input type="submit" value="login">
            </form>
          </center>
        </body>
      </html>
    `, {
      url: 'https://news.ycombinator.com/reply?id=47633987&goto=item%3Fid%3D47633396%2347633987',
    });

    vi.stubGlobal('location', dom.window.location);
    try {
      const page = parseLoginPage(dom.window.document);

      expect(page.variant).toBe('auth-gate');
      expect(page.title).toBe('You have to be logged in to reply.');
      expect(page.authMessage).toBe('You have to be logged in to reply.');
      expect(page.forms[0]?.submitLabel).toBe('login');
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
