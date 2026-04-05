import { describe, expect, it } from 'vitest';
import { parseHeader } from '@/parsers/header';
import { parseStoryList } from '@/parsers/storyList';
import { loadFixtureDocument } from '../helpers/loadFixture';

describe('story list fixtures', () => {
  it('parses the Hacker News header from the news fixture', async () => {
    const doc = await loadFixtureDocument('news.html');
    const header = parseHeader(doc);

    expect(header.navLinks).toHaveLength(9);
    expect(header.navLinks[0]).toMatchObject({
      label: 'Hacker News',
      href: 'news',
      active: true,
    });
    expect(header.user).toEqual({
      name: 'ewsbr',
      karma: 1,
    });
    expect(header.logoutUrl).toContain('logout?auth=');
  });

  it('parses ranked stories and pagination from the news fixture', async () => {
    const doc = await loadFixtureDocument('news.html');
    const storyList = parseStoryList(doc);
    const firstStory = storyList.stories[0];
    const lastStory = storyList.stories[storyList.stories.length - 1];

    expect(storyList.startRank).toBe(1);
    expect(storyList.stories).toHaveLength(30);
    expect(storyList.moreLink).toBe('?p=2');
    expect(firstStory).toMatchObject({
      id: '47536761',
      rank: 1,
      title: 'Show HN: I put an AI agent on a $7/month VPS with IRC as its transport layer',
      site: 'georgelarson.me',
      score: 86,
      author: 'j0rg3',
      commentCount: 33,
      isJob: false,
      isDead: false,
      isFlagged: false,
    });
    expect(lastStory).toMatchObject({
      id: '47492542',
      rank: 30,
      commentCount: 2,
    });
  });
});
