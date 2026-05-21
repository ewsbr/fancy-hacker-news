import { describe, expect, it, vi } from 'vitest';
import { parseLoginPage } from '@/parsers/login';
import { parseHtmlDocument } from '../helpers/dom';

describe('login page parser', () => {
  it('parses bare auth-gate messages from the source body', () => {
    const doc = parseHtmlDocument(`
      <html>
        <body>
          Please log in.<br><br>
          <center><a href="login?goto=news">login</a></center>
        </body>
      </html>
    `);

    vi.stubGlobal('location', new URL('https://news.ycombinator.com/fave?id=42009039'));
    try {
      const page = parseLoginPage(doc);

      expect(page.variant).toBe('auth-gate');
      expect(page.title).toBe('Please log in.');
      expect(page.authMessage).toBe('Please log in.');
    }
    finally {
      vi.unstubAllGlobals();
    }
  });

  it('parses reply auth-gate messages from the source body', () => {
    const doc = parseHtmlDocument(`
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
    `);

    vi.stubGlobal('location', new URL('https://news.ycombinator.com/reply?id=47633987&goto=item%3Fid%3D47633396%2347633987'));
    try {
      const page = parseLoginPage(doc);

      expect(page.variant).toBe('auth-gate');
      expect(page.title).toBe('You have to be logged in to reply.');
      expect(page.authMessage).toBe('You have to be logged in to reply.');
      expect(page.forms[0]?.submitLabel).toBe('login');
    }
    finally {
      vi.unstubAllGlobals();
    }
  });
});
