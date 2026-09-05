import { describe, expect, it } from 'vitest';
import { extractRichTextHtml, parseCommentBody } from '@/parsers/shared/body';
import { parseHtmlDocument } from '../helpers/dom';
import { loadFixtureDocument } from '../helpers/load-fixture';

describe('comment body parsing', () => {
  it('dedents the shared HN code-block prefix while preserving relative indentation', () => {
    const doc = parseHtmlDocument(`
      <div class="commtext c00">
        Before
        <pre><code>    first line
      second line
    third line</code></pre>
      </div>
    `);

    const html = extractRichTextHtml(doc.querySelector('.commtext'));

    expect(html).toContain('<pre><code>first line\n  second line\nthird line</code></pre>');
  });

  it('keeps quoted code blocks as code while trimming the shared HN prefix', () => {
    const doc = parseHtmlDocument(`
      <div class="comment">
        <div class="commtext c00">
          <pre><code>  &gt; quoted line
  plain line</code></pre>
        </div>
        <div class="reply"></div>
      </div>
    `);

    const parsed = parseCommentBody(doc.querySelector('.comment'));

    expect(parsed.html).toContain('<pre><code>&gt; quoted line\nplain line</code></pre>');
    expect(parsed.html).not.toContain('<blockquote>');
  });

  it('dedents real comment fixtures that carry a shared leading indent in each code line', async () => {
    const doc = await loadFixtureDocument('comments/code-block-leading-indent.html');
    const originalHtml = doc.documentElement.outerHTML;
    const parsed = parseCommentBody(doc.querySelector('.comment'));

    expect(parsed.html).toContain('<pre><code>[...]\n\n;; ANSWER SECTION:\ncanvas.ucdavis.edu. 1974 IN CNAME ucdavis-vanity.instructure.com.');
    expect(parsed.html).toContain('dig canvas.duke.edu<p></p><pre><code>;; ANSWER SECTION:\ncanvas.duke.edu. 300 IN CNAME duke-vanity.instructure.com.');
    expect(parsed.html).not.toContain('<code>    [...]');
    expect(parsed.html).not.toContain('\n    ;; ANSWER SECTION:');
    expect(parsed.html).not.toContain('\n    canvas.ucdavis.edu.');
    expect(doc.documentElement.outerHTML).toBe(originalHtml);
  });

  it('preserves long linked URLs from HN comment bodies', () => {
    const doc = parseHtmlDocument(`
      <div class="comment"><div class="commtext c00">Here's their preprint from a month ago, in case you can't access the Nature paper: <a href="https://www.biorxiv.org/content/10.64898/2026.05.08.723607v1" rel="nofollow">https://www.biorxiv.org/content/10.64898/2026.05.08.723607v1</a><p>Nature - <a href="https://www.nature.com/articles/s41586-026-10738-7" rel="nofollow">https://www.nature.com/articles/s41586-026-10738-7</a></p></div><div class="reply"><p><font size="1"><u><a href="reply?id=48506202&amp;goto=item%3Fid%3D48505231%2348506202" rel="nofollow">reply</a></u></font></p></div></div>
    `);

    const parsed = parseCommentBody(doc.querySelector('.comment'));

    expect(parsed.html).toContain('case you can\'t access the Nature paper: <a href="https://www.biorxiv.org/content/10.64898/2026.05.08.723607v1" rel="nofollow">https://www.biorxiv.org/content/10.64898/2026.05.08.723607v1</a>');
    expect(parsed.html).toContain('<p>Nature - <a href="https://www.nature.com/articles/s41586-026-10738-7" rel="nofollow">https://www.nature.com/articles/s41586-026-10738-7</a></p>');
    expect(parsed.html).not.toContain('reply?id=48506202');
  });
});
