import { describe, expect, it } from 'vitest';
import { parseUserPage } from '@/parsers/user';
import { loadFixtureDocument } from '../helpers/loadFixture';

describe('parseUserPage', () => {
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
