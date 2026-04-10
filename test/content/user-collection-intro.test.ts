import { describe, expect, it } from 'vitest';
import { JSDOM } from 'jsdom';
import { parseNewComments } from '@/parsers/new-comments';
import { parseStoryList } from '@/parsers/story-list';
import { parseUserCollectionIntro } from '@/content/utils/user-collection-intro';
import { loadFixtureDocument } from '../helpers/load-fixture';

describe('user collection intro parsing', () => {
  it('extracts favorites comment tabs and empty-state guidance', async () => {
    const doc = await loadFixtureDocument('comments/user/comments-empty.html');
    const page = parseNewComments(doc);
    const intro = parseUserCollectionIntro(page.introHtml, new JSDOM('').window.document);

    expect(intro).toEqual({
      links: [
        { href: 'favorites?id=axelriet', label: 'Submissions', kind: 'stories' },
        { href: 'favorites?id=axelriet&comments=t', label: 'Comments', kind: 'comments' },
      ],
      messages: [
        "axelriet hasn't added any favorite comments yet.",
        "To add one to your own favorites, click on its timestamp to go to its page, then click 'favorite' at the top.",
      ],
    });
  });

  it('extracts favorites story tabs without manufacturing empty guidance', async () => {
    const doc = await loadFixtureDocument('stories/user/favorites-other.html');
    const page = parseStoryList(doc);
    const intro = parseUserCollectionIntro(page.introHtml, new JSDOM('').window.document);

    expect(intro).toEqual({
      links: [
        { href: 'favorites?id=cl3misch', label: 'Submissions', kind: 'stories' },
        { href: 'favorites?id=cl3misch&comments=t', label: 'Comments', kind: 'comments' },
      ],
      messages: [],
    });
  });

  it('ignores ordinary notices that are not collection switchers', async () => {
    const doc = await loadFixtureDocument('comments/bestcomments.html');
    const page = parseNewComments(doc);
    const intro = parseUserCollectionIntro(page.introHtml, new JSDOM('').window.document);

    expect(intro).toBeNull();
  });

  it('accepts leading-slash and absolute collection links', () => {
    const html = `
      <div>
        <a href="/favorites?id=4qt23">submissions</a> |
        <a href="https://news.ycombinator.com/favorites?id=4qt23&comments=t">comments</a>
        <p>no favorites yet</p>
      </div>
    `;

    const intro = parseUserCollectionIntro(html, new JSDOM('').window.document);

    expect(intro).toEqual({
      links: [
        { href: '/favorites?id=4qt23', label: 'Submissions', kind: 'stories' },
        {
          href: 'https://news.ycombinator.com/favorites?id=4qt23&comments=t',
          label: 'Comments',
          kind: 'comments',
        },
      ],
      messages: ['no favorites yet'],
    });
  });
});
