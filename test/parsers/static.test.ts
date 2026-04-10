import { describe, expect, it } from 'vitest';
import { JSDOM } from 'jsdom';
import { parseStaticPage } from '@/parsers/static';
import { loadFixtureDocument } from '../helpers/load-fixture';

describe('static page parser', () => {
  it('promotes standalone legacy bold headings from the FAQ fixture', async () => {
    const doc = await loadFixtureDocument('newsfaq.html');
    const page = parseStaticPage(doc);

    expect(page.contentHtml).toContain('<h1>Hacker News FAQ</h1>');
    expect(page.contentHtml).toContain('<h2 id="flag">What does [flagged] mean?</h2>');
    expect(page.contentHtml).toContain(
      'Users flagged the post as breaking the <a href="newsguidelines.html">guidelines</a>'
    );
  });

  it('preserves mixed paragraph text after a bold label on legacy pages', () => {
    const doc = new JSDOM(`
      <html>
        <body>
          <center>
            <table width="500" cellpadding="0">
              <tr>
                <td bgcolor="#fafaf0">
                  <b>Security</b>
                  <p>
                    <b>Missing From This List?</b>
                    If you reported a vulnerability to us and don't see your name,
                    please shoot us an email and we'll happily add you.
                  </p>
                </td>
              </tr>
            </table>
          </center>
        </body>
      </html>
    `).window.document;

    const page = parseStaticPage(doc);

    expect(page.contentHtml).toContain('<h1>Security</h1>');
    expect(page.contentHtml).toContain('<b>Missing From This List?</b>');
    expect(page.contentHtml).toContain(
      "If you reported a vulnerability to us and don't see your name,"
    );
    expect(page.contentHtml).not.toContain('<h2>Missing From This List?</h2>');
  });

  it('preserves table cell background attributes for static color tables', () => {
    const doc = new JSDOM(`
      <html>
        <body>
          <table id="hnmain">
            <tr id="bigbox">
              <td>
                <div>Custom Colors</div>
                <table>
                  <tr>
                    <td>#ff6600</td>
                    <td bgcolor="#ff6600"></td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `).window.document;

    const page = parseStaticPage(doc);

    expect(page.contentHtml).toContain('Custom Colors');
    expect(page.contentHtml).toContain('bgcolor="#ff6600"');
  });

  it('normalizes bookmarklet call-to-action links on legacy static pages', async () => {
    const doc = await loadFixtureDocument('static/bookmarklet.html');
    const page = parseStaticPage(doc);

    expect(page.contentHtml).toContain('class="hn-bookmarklet-cta"');
    expect(page.contentHtml).toContain('class="hn-bookmarklet-link"');
    expect(page.contentHtml).toContain('post to HN</a>');
    expect(page.contentHtml).not.toContain('font-size: 2em');
    expect(page.contentHtml).not.toContain('color: #777');
  });
});
