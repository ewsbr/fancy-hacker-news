import type { ParsedRoutePage } from '@/content/route-page';
import { describe, expect, it } from 'vitest';
import CommentsPage from '@/content/pages/CommentsPage.vue';
import LoginPage from '@/content/pages/LoginPage.vue';
import NewCommentsPage from '@/content/pages/NewCommentsPage.vue';
import NotFoundPage from '@/content/pages/NotFoundPage.vue';
import ReplyPage from '@/content/pages/ReplyPage.vue';
import StoriesPage from '@/content/pages/StoriesPage.vue';
import SubmitPage from '@/content/pages/SubmitPage.vue';
import { parseRoutePage } from '@/content/route-page';
import { makeNotFoundRoute, resolveRoute } from '@/router';
import { createHtmlDocument, parseHtmlDocument } from '../helpers/dom';
import { loadFixtureDocument } from '../helpers/load-fixture';

type ItemRoutePage = Extract<ParsedRoutePage, { route: { page: 'item' } }>;

function makeLocation(path: string): Location {
  return new URL(`https://news.ycombinator.com${path}`) as unknown as Location;
}

async function parseFixtureRoute(path: string, fixture: string) {
  const location = makeLocation(path);
  const doc = await loadFixtureDocument(fixture);
  return parseRoutePage(resolveRoute(location), doc, location);
}

function makeCommentRow(id: string, indent: number, body: string) {
  return `
    <tr class="athing comtr" id="${id}">
      <td><table border="0"><tbody><tr>
        <td class="ind" indent="${indent}"><img src="s.gif" height="1" width="${indent * 40}"></td>
        <td class="votelinks"></td>
        <td class="default">
          <span class="comhead">
            <a href="user?id=${id}" class="hnuser">${id}</a>
            <span class="age" title="2026-04-05T12:00:00"><a href="item?id=${id}">1 hour ago</a></span>
          </span>
          <div class="comment"><div class="commtext c00">${body}</div></div>
        </td>
      </tr></tbody></table></td>
    </tr>
  `;
}

function makeLargeItemDocument() {
  const extraRoots = Array.from({ length: 1000 }, (_item, index) => (
    makeCommentRow(`extra-${index}`, 0, `extra ${index}`)
  )).join('');

  return parseHtmlDocument(`
    <table class="fatitem">
      <tr class="athing submission" id="999">
        <td class="title"><span class="rank"></span></td>
        <td class="votelinks"></td>
        <td class="title">
          <span class="titleline"><a href="https://example.com/story">Example story</a></span>
        </td>
      </tr>
      <tr>
        <td colspan="2"></td>
        <td class="subtext">
          <span class="subline">
            <span class="score" id="score_999">42 points</span>
            by <a href="user?id=pg" class="hnuser">pg</a>
            <span class="age" title="2026-04-05T12:00:00"><a href="item?id=999">1 hour ago</a></span>
          </span>
        </td>
      </tr>
    </table>
    <table class="comment-tree"><tbody>
      ${makeCommentRow('target-root', 0, 'target root')}
      ${makeCommentRow('target-child', 1, 'target child')}
      ${extraRoots}
    </tbody></table>
  `);
}

describe('parseRoutePage', () => {
  it('selects story and comment renderers for user collection tabs', async () => {
    const favoriteStories = await parseFixtureRoute('/favorites?id=cl3misch', 'stories/user/favorites-other.html');
    const upvotedStories = await parseFixtureRoute('/upvoted?id=cl3misch', 'stories/user/favorites-other.html');
    const favoriteComments = await parseFixtureRoute('/favorites?id=cl3misch&comments=t', 'comments/user/comments-other.html');
    const upvotedComments = await parseFixtureRoute('/upvoted?id=cl3misch&comments=t', 'comments/user/comments-other.html');

    expect(favoriteStories.component).toBe(StoriesPage);
    expect(upvotedStories.component).toBe(StoriesPage);
    expect(favoriteComments.component).toBe(NewCommentsPage);
    expect(upvotedComments.component).toBe(NewCommentsPage);
    expect(favoriteStories.pageData).toHaveProperty('stories');
    expect(favoriteComments.pageData).toHaveProperty('comments');
  });

  it('selects submit fallback renderers from parsed page data', async () => {
    const submitPage = await parseFixtureRoute('/submit', 'misc/forms/submit.html');
    const submitLoginPage = await parseFixtureRoute('/submit', 'misc/auth/submit-nologin.html');

    expect(submitPage.component).toBe(SubmitPage);
    expect(submitLoginPage.component).toBe(LoginPage);
  });

  it.each(['reply', 'replyx'])('renders the native reply form at /%s with its return target intact', async (endpoint) => {
    const page = await parseFixtureRoute(`/${endpoint}?id=47538487&goto=item%3Fid%3D47536761%2347538487`, 'misc/forms/reply.html');

    expect(page.route).toEqual({
      page: 'reply',
      params: { id: '47538487', goto: 'item?id=47536761#47538487' },
    });
    expect(page.component).toBe(ReplyPage);
    expect(page.pageData).toHaveProperty('replyForm', {
      action: 'comment',
      parentId: '47538487',
      gotoUrl: 'item?id=47536761#47538487',
      hmac: expect.any(String),
    });
  });

  it.each([
    { path: '/replyx?id=49643384', fixture: 'replyx-nologin', action: 'replyx', state: [{ name: 'id', value: '49643384' }] },
    { path: '/reply?id=49643384', fixture: 'reply-nologin', action: '', state: [{ name: 'from-op', value: 'reply' }] },
  ])('renders auth forms at $path with native submission state', async ({ path, fixture, action, state }) => {
    const page = await parseFixtureRoute(path, `misc/auth/${fixture}.html`);

    expect(page.component).toBe(LoginPage);
    expect(page.pageData).toHaveProperty('forms', [
      expect.objectContaining({ action, method: 'post', hiddenFields: state, submitLabel: 'login' }),
      expect.objectContaining({ action, method: 'post', hiddenFields: [...state, { name: 'creating', value: 't' }], submitLabel: 'create account' }),
    ]);
  });

  it('passes the resolved auth path to parsers of isolated documents', async () => {
    const page = await parseFixtureRoute('/forgot', 'misc/auth/forgot.html');

    expect(page.component).toBe(LoginPage);
    expect(page.pageData).toMatchObject({ variant: 'forgot', title: 'Reset Password' });
  });

  it('keeps x validation pages on the static route while rendering the submit form', async () => {
    const xPage = await parseFixtureRoute('/x', 'stories/x.html');

    expect(xPage.route.page).toBe('static');
    expect(xPage.component).toBe(SubmitPage);
    expect(xPage.pageData).toHaveProperty('warningMessage', 'That\'s not a valid title.');
  });

  it('passes item hashes to the item parser', () => {
    const location = makeLocation('/item?id=999#target-child');
    const page = parseRoutePage(resolveRoute(location), makeLargeItemDocument(), location);

    expect(page.component).toBe(CommentsPage);

    if (page.route.page !== 'item') {
      throw new Error(`Expected item route, got ${page.route.page}`);
    }

    const itemPage = page as ItemRoutePage;
    const targetRoot = itemPage.pageData.comments.find(comment => comment.id === 'target-root');

    expect(targetRoot?.lazyThread).toBeNull();
    expect(targetRoot?.children[0]?.id).toBe('target-child');
  });

  it('selects the notfound renderer without parsing page data', () => {
    const location = makeLocation('/missing?id=1');
    const page = parseRoutePage(makeNotFoundRoute(location), createHtmlDocument(), location);

    expect(page.route).toEqual({
      page: 'notfound',
      params: { path: '/missing?id=1' },
    });
    expect(page.pageData).toBeNull();
    expect(page.component).toBe(NotFoundPage);
  });
});
