import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';
import { JSDOM } from 'jsdom';
import { parseHeader } from '@/parsers/header';
import { parseItemPage } from '@/parsers/item';
import { parseNewComments } from '@/parsers/newComments';
import { parseThreadsPage } from '@/parsers/threads';
import { parseStoryList } from '@/parsers/storyList';
import { loadFixtureDocument } from '../helpers/loadFixture';

function flattenComments(nodes: ReturnType<typeof parseItemPage>['comments']): ReturnType<typeof parseItemPage>['comments'] {
  return nodes.flatMap(node => [node, ...flattenComments(node.children)]);
}

async function loadFixtureHtml(name: string): Promise<string> {
  const fixtureUrl = new URL(`../fixtures/${name}`, import.meta.url);
  return readFile(fixtureUrl, 'utf8');
}

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
    expect(storyList.introHtml).toBeNull();
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

  it('parses unranked stories without synthesizing numeric ranks', async () => {
    const doc = await loadFixtureDocument('stories/invited.html');
    const storyList = parseStoryList(doc);

    expect(storyList.stories[0]).toMatchObject({
      id: '47438169',
      rank: null,
      title: 'An FAQ on Reinforcement Learning Environments',
    });
    expect(storyList.moreLink).toBe('invited?next=44981802');
  });

  it('preserves intro content for story list variants like best', async () => {
    const doc = await loadFixtureDocument('stories/best.html');
    const storyList = parseStoryList(doc);

    expect(storyList.introHtml).toContain('Most-upvoted stories of the last 48 hours');
    expect(storyList.introHtml).toContain('best?h=24');
  });

  it('detects dead stories when the status marker sits outside the title link', async () => {
    const doc = await loadFixtureDocument('jobs.html');
    const storyList = parseStoryList(doc);
    const deadStory = storyList.stories.find(story => story.id === '47442774');

    expect(deadStory).toMatchObject({
      id: '47442774',
      title: 'Gauntlet AI (YC S17): Fly you to Austin, train you in AI, give you $200k+ job',
      isDead: true,
      isFlagged: false,
      isDeleted: false,
    });
  });

  it('parses story status markers on item pages, including deleted stories', () => {
    const dom = new JSDOM(`
      <table class="fatitem">
        <tr class="athing submission" id="123">
          <td class="title"><span class="rank"></span></td>
          <td class="votelinks"></td>
          <td class="title">
            <span class="titleline"> [deleted] [flagged] [dead] <a>Former title</a></span>
          </td>
        </tr>
        <tr>
          <td colspan="2"></td>
          <td class="subtext">
            <span class="subline">
              <span class="score" id="score_123">42 points</span>
              by <a href="user?id=pg" class="hnuser">pg</a>
              <span class="age" title="2026-04-05T12:00:00"><a href="item?id=123">1 hour ago</a></span>
            </span>
          </td>
        </tr>
      </table>
      <table class="comment-tree"></table>
    `);

    const page = parseItemPage(dom.window.document);

    expect(page.item).toMatchObject({
      type: 'story',
      title: 'Former title',
      isDead: true,
      isFlagged: true,
      isDeleted: true,
    });
  });

  it('parses story unvote links on item pages when HN renders them outside td.votelinks', () => {
    const dom = new JSDOM(`
      <table class="fatitem">
        <tr class="athing submission" id="123">
          <td class="title"><span class="rank"></span></td>
          <td class="votelinks">
            <a href="vote?id=123&amp;how=up&amp;auth=upauth&amp;goto=item%3Fid%3D123"><div class="votearrow"></div></a>
          </td>
          <td class="title">
            <span class="titleline"><a href="https://example.com/story">Example story</a></span>
          </td>
        </tr>
        <tr>
          <td colspan="2"></td>
          <td class="subtext">
            <span class="subline">
              <span class="score" id="score_123">42 points</span>
              by <a href="user?id=pg" class="hnuser">pg</a>
              <span class="age" title="2026-04-05T12:00:00"><a href="item?id=123">1 hour ago</a></span>
              <span id="unv_123"> | <a id="un_123" href="vote?id=123&amp;how=un&amp;auth=unauth&amp;goto=item%3Fid%3D123&amp;js=t">unvote</a></span>
            </span>
          </td>
        </tr>
      </table>
      <table class="comment-tree"></table>
    `);

    const page = parseItemPage(dom.window.document);

    expect(page.item.voteUp).toContain('how=up');
    expect(page.item.voteUn).toContain('how=un');
    expect(page.item.voteUn).toContain('js=t');
  });

  it('tracks dead status for flat comments on new comments pages', () => {
    const dom = new JSDOM(`
      <table>
        <tr class="athing" id="456">
          <td class="votelinks"></td>
          <td class="default">
            <span class="comhead">
              <a href="user?id=alice" class="hnuser">alice</a>
              <span class="age" title="2026-04-05T12:00:00"><a href="item?id=456">1 hour ago</a></span>
              [dead]
              <span class="onstory"><a href="item?id=123">Example story</a></span>
            </span>
            <div class="comment">
              <div class="commtext c00">still visible body</div>
            </div>
          </td>
        </tr>
      </table>
    `);

    const page = parseNewComments(dom.window.document);

    expect(page.comments[0]).toMatchObject({
      id: '456',
      isDead: true,
      isFlagged: false,
      isDeleted: false,
      bodyHtml: 'still visible body',
    });
  });

  it('preserves intro content for comment list variants like bestcomments', async () => {
    const doc = await loadFixtureDocument('comments/bestcomments.html');
    const page = parseNewComments(doc);

    expect(page.introHtml).toContain('Most-upvoted comments of the last 48 hours');
    expect(page.introHtml).toContain('bestcomments?h=24');
    expect(page.comments[0]).toMatchObject({
      id: '47633987',
      author: 'jesse_dot_id',
    });
  });

  it('parses latest thread views with the flat comment parser', async () => {
    const doc = await loadFixtureDocument('comments/latest.html');
    const page = parseNewComments(doc);

    expect(page.introHtml).toBeNull();
    expect(page.moreLink).toBeNull();
    expect(page.comments[0]).toMatchObject({
      id: '42021015',
      author: 'janalsncm',
      age: 'on Nov 1, 2024',
      onStory: {
        title: 'Model Distillation in the API',
        link: 'item?id=42009039',
      },
    });
    expect(page.comments.find(comment => comment.id === '42010428')).toMatchObject({
      id: '42010428',
      author: 'mentalically',
      authorIsNew: true,
      grayLevel: 'cdd',
      isDead: true,
      isFlagged: false,
      isDeleted: false,
    });
  });

  it('parses dead comments from the item-page comment tree fixture', async () => {
    const doc = await loadFixtureDocument('story-artemis-withdead.html');
    const page = parseItemPage(doc);
    const comments = flattenComments(page.comments);

    const deadCommentIds = ['47651506', '47650684', '47650910'];

    expect(deadCommentIds).toHaveLength(3);
    for (const id of deadCommentIds) {
      expect(comments.find(comment => comment.id === id)).toMatchObject({
        id,
        isDead: true,
        isFlagged: true,
        isDeleted: false,
      });
    }
  });

  it('parses comment unvote links from wrapped item-page rows', async () => {
    const rowHtml = await loadFixtureHtml('unvote.html');
    const dom = new JSDOM(`
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
      <table class="comment-tree"><tbody>${rowHtml}</tbody></table>
    `);

    const page = parseItemPage(dom.window.document);

    expect(page.comments).toHaveLength(1);
    expect(page.comments[0]).toMatchObject({
      id: '47652278',
      voteUp: expect.stringContaining('how=up'),
      voteUn: expect.stringContaining('how=un'),
    });
  });

  it('uses root shells for extreme threads while eagerly parsing the hash-target root', () => {
    const dom = new JSDOM(`
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
        <tr class="athing comtr" id="c1">
          <td><table border="0"><tbody><tr>
            <td class="ind" indent="0"><img src="s.gif" height="1" width="0"></td>
            <td class="votelinks"></td>
            <td class="default">
              <span class="comhead">
                <a href="user?id=alice" class="hnuser">alice</a>
                <span class="age" title="2026-04-05T12:00:00"><a href="item?id=c1">1 hour ago</a></span>
              </span>
              <div class="comment"><div class="commtext c00">root one</div></div>
            </td>
          </tr></tbody></table></td>
        </tr>
        <tr class="athing comtr" id="c2">
          <td><table border="0"><tbody><tr>
            <td class="ind" indent="1"><img src="s.gif" height="1" width="40"></td>
            <td class="votelinks"></td>
            <td class="default">
              <span class="comhead">
                <a href="user?id=bob" class="hnuser">bob</a>
                <span class="age" title="2026-04-05T12:05:00"><a href="item?id=c2">55 minutes ago</a></span>
              </span>
              <div class="comment"><div class="commtext c00">child one</div></div>
            </td>
          </tr></tbody></table></td>
        </tr>
        <tr class="athing comtr" id="c3">
          <td><table border="0"><tbody><tr>
            <td class="ind" indent="0"><img src="s.gif" height="1" width="0"></td>
            <td class="votelinks"></td>
            <td class="default">
              <span class="comhead">
                <a href="user?id=carol" class="hnuser">carol</a>
                <span class="age" title="2026-04-05T12:10:00"><a href="item?id=c3">50 minutes ago</a></span>
              </span>
              <div class="comment"><div class="commtext c00">root two</div></div>
            </td>
          </tr></tbody></table></td>
        </tr>
        <tr class="athing comtr" id="c4">
          <td><table border="0"><tbody><tr>
            <td class="ind" indent="1"><img src="s.gif" height="1" width="40"></td>
            <td class="votelinks"></td>
            <td class="default">
              <span class="comhead">
                <a href="user?id=dave" class="hnuser">dave</a>
                <span class="age" title="2026-04-05T12:15:00"><a href="item?id=c4">45 minutes ago</a></span>
              </span>
              <div class="comment"><div class="commtext c00">child two</div></div>
            </td>
          </tr></tbody></table></td>
        </tr>
      </tbody></table>
    `);

    const page = parseItemPage(dom.window.document, {
      extremeThreadCommentThreshold: 2,
      initialHashTargetId: 'c4',
    });

    expect(page.comments).toHaveLength(2);
    expect(page.comments[0]).toMatchObject({
      id: 'c1',
      descendantCount: 1,
      children: [],
    });
    expect(page.comments[0].lazyThread?.totalCommentCount).toBe(2);

    expect(page.comments[1]).toMatchObject({
      id: 'c3',
      descendantCount: 1,
    });
    expect(page.comments[1].lazyThread).toBeNull();
    expect(page.comments[1].children[0]).toMatchObject({
      id: 'c4',
      bodyHtml: 'child two',
    });
  });

  it('does not create lazy loaders for roots with no replies', () => {
    const dom = new JSDOM(`
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
        <tr class="athing comtr" id="solo">
          <td><table border="0"><tbody><tr>
            <td class="ind" indent="0"><img src="s.gif" height="1" width="0"></td>
            <td class="votelinks"></td>
            <td class="default">
              <span class="comhead">
                <a href="user?id=solo" class="hnuser">solo</a>
                <span class="age" title="2026-04-05T12:00:00"><a href="item?id=solo">1 hour ago</a></span>
              </span>
              <div class="comment"><div class="commtext c00">standalone root</div></div>
            </td>
          </tr></tbody></table></td>
        </tr>
        <tr class="athing comtr" id="branch">
          <td><table border="0"><tbody><tr>
            <td class="ind" indent="0"><img src="s.gif" height="1" width="0"></td>
            <td class="votelinks"></td>
            <td class="default">
              <span class="comhead">
                <a href="user?id=branch" class="hnuser">branch</a>
                <span class="age" title="2026-04-05T12:05:00"><a href="item?id=branch">55 minutes ago</a></span>
              </span>
              <div class="comment"><div class="commtext c00">branch root</div></div>
            </td>
          </tr></tbody></table></td>
        </tr>
        <tr class="athing comtr" id="leaf">
          <td><table border="0"><tbody><tr>
            <td class="ind" indent="1"><img src="s.gif" height="1" width="40"></td>
            <td class="votelinks"></td>
            <td class="default">
              <span class="comhead">
                <a href="user?id=leaf" class="hnuser">leaf</a>
                <span class="age" title="2026-04-05T12:10:00"><a href="item?id=leaf">50 minutes ago</a></span>
              </span>
              <div class="comment"><div class="commtext c00">leaf reply</div></div>
            </td>
          </tr></tbody></table></td>
        </tr>
      </tbody></table>
    `);

    const page = parseItemPage(dom.window.document, {
      extremeThreadCommentThreshold: 1,
    });

    expect(page.comments[0]).toMatchObject({
      id: 'solo',
      descendantCount: 0,
    });
    expect(page.comments[0].lazyThread).toBeNull();
    expect(page.comments[1].lazyThread?.totalCommentCount).toBe(2);
  });

  it('parses flat comment unvote links when they are rendered in the header span', () => {
    const dom = new JSDOM(`
      <table>
        <tr class="athing" id="456">
          <td class="votelinks">
            <a href="vote?id=456&amp;how=up&amp;auth=upauth&amp;goto=newcomments"><div class="votearrow"></div></a>
          </td>
          <td class="default">
            <span class="comhead">
              <a href="user?id=alice" class="hnuser">alice</a>
              <span class="age" title="2026-04-05T12:00:00"><a href="item?id=456">1 hour ago</a></span>
              <span id="unv_456"> | <a id="un_456" href="vote?id=456&amp;how=un&amp;auth=unauth&amp;goto=newcomments&amp;js=t">unvote</a></span>
              <span class="onstory"><a href="item?id=123">Example story</a></span>
            </span>
            <div class="comment">
              <div class="commtext c00">still visible body</div>
            </div>
          </td>
        </tr>
      </table>
    `);

    const page = parseNewComments(dom.window.document);

    expect(page.comments[0]).toMatchObject({
      id: '456',
      voteUp: expect.stringContaining('how=up'),
      voteUn: expect.stringContaining('how=un'),
    });
  });

  it('parses thread unvote links when they are rendered in the header span', () => {
    const dom = new JSDOM(`
      <title>alice's comments | Hacker News</title>
      <table>
        <tr class="athing comtr" id="456">
          <td><table border="0"><tbody><tr>
            <td class="ind" indent="0"><img src="s.gif" height="1" width="0"></td>
            <td class="votelinks">
              <a href="vote?id=456&amp;how=up&amp;auth=upauth&amp;goto=threads%3Fid%3Dalice"><div class="votearrow"></div></a>
            </td>
            <td class="default">
              <span class="comhead">
                <a href="user?id=alice" class="hnuser">alice</a>
                <span class="age" title="2026-04-05T12:00:00"><a href="item?id=456">1 hour ago</a></span>
                <span id="unv_456"> | <a id="un_456" href="vote?id=456&amp;how=un&amp;auth=unauth&amp;goto=threads%3Fid%3Dalice&amp;js=t">unvote</a></span>
                <span class="navs"><a href="#123">root</a></span>
                <span class="onstory"><a href="item?id=123">Example story</a></span>
              </span>
              <div class="comment">
                <div class="commtext c00">still visible body</div>
                <div class="reply"><p><font size="1"><u><a href="reply?id=456">reply</a></u></font></p></div>
              </div>
            </td>
          </tr></tbody></table></td>
        </tr>
      </table>
    `);

    const page = parseThreadsPage(dom.window.document);

    expect(page.threads[0]).toMatchObject({
      id: '456',
      voteUp: expect.stringContaining('how=up'),
      voteUn: expect.stringContaining('how=un'),
    });
  });

  it('normalizes item-page comment nav links to in-page hashes', async () => {
    const doc = await loadFixtureDocument('story.html');
    const page = parseItemPage(doc);
    const comments = flattenComments(page.comments);
    const nestedComment = comments.find(comment => comment.id === '47537932');

    expect(nestedComment?.navLinks).toMatchObject({
      root: '#47536778',
      parent: '#47537857',
      next: '#47537213',
      context: null,
    });
  });

  it('preserves thread-page nav links exactly as rendered by HN', async () => {
    const doc = await loadFixtureDocument('user-comments.html');
    const page = parseThreadsPage(doc);

    expect(page.threads[0]).toMatchObject({
      id: '47536778',
      navLinks: {
        parent: 'item?id=47536761',
        context: 'item?id=47536761#47536778',
        next: '#13899826',
      },
      onStory: {
        link: 'item?id=47536761',
      },
    });

    expect(page.threads[0].children[0]).toMatchObject({
      id: '47538011',
      navLinks: {
        parent: '#47536778',
        next: '#47537213',
      },
      onStory: null,
    });
  });
});
