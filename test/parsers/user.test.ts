import { describe, expect, it } from 'vitest';
import { JSDOM } from 'jsdom';
import { parseUserPage } from '@/parsers/user';
import { loadFixtureDocument } from '../helpers/load-fixture';

function makePublicUserDocument(aboutHtml: string): Document {
  return new JSDOM(`
    <table id="hnmain">
      <tbody>
        <tr id="bigbox">
          <td>
            <table>
              <tbody>
                <tr class="athing"><td>user:</td><td><a href="user?id=sampleuser" class="hnuser">sampleuser</a></td></tr>
                <tr><td>created:</td><td><a href="front?day=2011-05-18&amp;birth=sampleuser">May 18, 2011</a></td></tr>
                <tr><td>karma:</td><td>123</td></tr>
                <tr><td>about:</td><td style="overflow:hidden">${aboutHtml}</td></tr>
                <tr><td></td><td><a href="submitted?id=sampleuser"><u>submissions</u></a></td></tr>
                <tr><td></td><td><a href="threads?id=sampleuser"><u>comments</u></a></td></tr>
                <tr><td></td><td><a href="favorites?id=sampleuser"><u>favorites</u></a></td></tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  `).window.document;
}

function getAboutLinks(page: ReturnType<typeof parseUserPage>): Array<{ text: string; href: string }> {
  return page.aboutBlocks.flatMap(block =>
    block.segments.flatMap(segment =>
      segment.type === 'link' ? [{ text: segment.text, href: segment.href }] : [],
    ),
  );
}

describe('parseUserPage', () => {
  it('linkifies bare URLs in public profile about text', () => {
    const doc = makePublicUserDocument(
      '[ my public key: https://example.invalid/sample-key; my proof: https://example.invalid/sample-proof ]',
    );
    const page = parseUserPage(doc);

    expect(page.about).toBe(
      '[ my public key: https://example.invalid/sample-key; my proof: https://example.invalid/sample-proof ]',
    );
    expect(getAboutLinks(page)).toEqual([
      { text: 'https://example.invalid/sample-key', href: 'https://example.invalid/sample-key' },
      { text: 'https://example.invalid/sample-proof', href: 'https://example.invalid/sample-proof' },
    ]);
  });

  it('keeps public profile paragraphs and links structured instead of HTML strings', () => {
    const doc = makePublicUserDocument('Software person<p>Based somewhere</p><p>https://example.invalid/profile</p>');
    const page = parseUserPage(doc);

    expect(page.about).toBe('Software person\n\nBased somewhere\n\nhttps://example.invalid/profile');
    expect(page.aboutBlocks.at(-1)).toEqual({
      segments: [
        {
          type: 'link',
          text: 'https://example.invalid/profile',
          href: 'https://example.invalid/profile',
        },
      ],
    });
  });

  it('does not preserve unsafe profile about markup or href protocols', () => {
    const doc = makePublicUserDocument(`
      Hello <img src="x" onerror="alert(1)">
      <script>alert(2)</script>
      <a href="javascript:alert(3)">bad link</a>
      <a href="java&#10;script:alert(4)">control link</a>
      <a href="https://example.com/safe">safe link</a>
      www.example.org.
    `);
    const page = parseUserPage(doc);
    const serialized = JSON.stringify(page.aboutBlocks);

    expect(serialized).not.toContain('alert');
    expect(serialized).not.toContain('javascript:');
    expect(serialized).not.toContain('onerror');
    expect(page.about).toContain('bad link');
    expect(page.about).toContain('control link');
    expect(getAboutLinks(page)).toEqual([
      { text: 'safe link', href: 'https://example.com/safe' },
      { text: 'www.example.org', href: 'https://www.example.org' },
    ]);
  });

  it('extracts favorites and upvoted comment links from the profile fixture', async () => {
    const doc = await loadFixtureDocument('user.html');
    const page = parseUserPage(doc);

    expect(page.favoritesLink).toBe('favorites?id=ewsbr');
    expect(page.favoritesCommentsLink).toBe('favorites?id=ewsbr&comments=t');
    expect(page.upvotedLink).toBe('upvoted?id=ewsbr');
    expect(page.upvotedCommentsLink).toBe('upvoted?id=ewsbr&comments=t');
  });

  it('accepts leading-slash and absolute collection URLs', async () => {
    const doc = await loadFixtureDocument('user.html');

    const favoriteLinks = Array.from(doc.querySelectorAll<HTMLAnchorElement>('a[href*="favorites?id=ewsbr"]'));
    favoriteLinks[0]?.setAttribute('href', '/favorites?id=ewsbr');
    favoriteLinks[1]?.setAttribute('href', 'https://news.ycombinator.com/favorites?id=ewsbr&comments=t');

    const upvotedLinks = Array.from(doc.querySelectorAll<HTMLAnchorElement>('a[href*="upvoted?id=ewsbr"]'));
    upvotedLinks[0]?.setAttribute('href', '/upvoted?id=ewsbr');
    upvotedLinks[1]?.setAttribute('href', 'https://news.ycombinator.com/upvoted?id=ewsbr&comments=t');

    const page = parseUserPage(doc);

    expect(page.favoritesLink).toBe('/favorites?id=ewsbr');
    expect(page.favoritesCommentsLink).toBe('https://news.ycombinator.com/favorites?id=ewsbr&comments=t');
    expect(page.upvotedLink).toBe('/upvoted?id=ewsbr');
    expect(page.upvotedCommentsLink).toBe('https://news.ycombinator.com/upvoted?id=ewsbr&comments=t');
  });

  it('builds missing comments links from the base collection href', async () => {
    const doc = await loadFixtureDocument('user.html');

    doc
      .querySelector<HTMLAnchorElement>('a[href="favorites?id=ewsbr&comments=t"]')
      ?.remove();
    doc
      .querySelector<HTMLAnchorElement>('a[href="upvoted?id=ewsbr&comments=t"]')
      ?.remove();

    const page = parseUserPage(doc);

    expect(page.favoritesLink).toBe('favorites?id=ewsbr');
    expect(page.favoritesCommentsLink).toBe('favorites?id=ewsbr&comments=t');
    expect(page.upvotedLink).toBe('upvoted?id=ewsbr');
    expect(page.upvotedCommentsLink).toBe('upvoted?id=ewsbr&comments=t');
  });
});
