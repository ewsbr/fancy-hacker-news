import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import { extractRichTextHtml, parseCommentBody } from '@/parsers/shared/body';
import { loadFixtureDocument } from '../helpers/load-fixture';

describe('comment body parsing', () => {
  it('dedents the shared HN code-block prefix while preserving relative indentation', () => {
    const dom = new JSDOM(`
      <div class="commtext c00">
        Before
        <pre><code>    first line
      second line
    third line</code></pre>
      </div>
    `);

    const html = extractRichTextHtml(dom.window.document.querySelector('.commtext'));

    expect(html).toContain('<pre><code>first line\n  second line\nthird line</code></pre>');
  });

  it('keeps quoted code blocks as code while trimming the shared HN prefix', () => {
    const dom = new JSDOM(`
      <div class="comment">
        <div class="commtext c00">
          <pre><code>  &gt; quoted line
  plain line</code></pre>
        </div>
        <div class="reply"></div>
      </div>
    `);

    const parsed = parseCommentBody(dom.window.document.querySelector('.comment'));

    expect(parsed.html).toContain('<pre><code>&gt; quoted line\nplain line</code></pre>');
    expect(parsed.html).not.toContain('<blockquote>');
  });

  it('dedents real comment fixtures that carry a shared leading indent in each code line', async () => {
    const doc = await loadFixtureDocument('comments/code-block-leading-indent.html');
    const parsed = parseCommentBody(doc.querySelector('.comment'));

    expect(parsed.html).toContain('<pre><code>[...]\n\n;; ANSWER SECTION:\ncanvas.ucdavis.edu. 1974 IN CNAME ucdavis-vanity.instructure.com.');
    expect(parsed.html).toContain('dig canvas.duke.edu<p></p><pre><code>;; ANSWER SECTION:\ncanvas.duke.edu. 300 IN CNAME duke-vanity.instructure.com.');
    expect(parsed.html).not.toContain('<code>    [...]');
    expect(parsed.html).not.toContain('\n    ;; ANSWER SECTION:');
    expect(parsed.html).not.toContain('\n    canvas.ucdavis.edu.');
  });
});
