import { describe, expect, it } from 'vitest';
import { parseItemPage } from '@/parsers/item';
import { parseHtmlDocument } from '../helpers/dom';

describe('item parser', () => {
  it('scopes poll option parsing to the poll table and preserves source order', () => {
    const doc = parseHtmlDocument(`
      <table class="fatitem">
        <tr class="athing submission" id="123">
          <td class="title"><span class="rank"></span></td>
          <td class="votelinks"></td>
          <td class="title">
            <span class="titleline"><a href="item?id=123">Example poll</a></span>
          </td>
        </tr>
        <tr>
          <td colspan="2"></td>
          <td class="subtext">
            <span class="subline">
              <span class="score" id="score_123">42 points</span>
              by <a href="user?id=pg" class="hnuser">pg</a>
              <span class="age" title="2026-04-05T12:00:00"><a href="item?id=123">1 hour ago</a></span>
              <span id="unv_123"></span>
            </span>
          </td>
        </tr>
        <tr>
          <td colspan="2"></td>
          <td><div class="toptext">Prompt</div></td>
        </tr>
        <tr>
          <td colspan="2"></td>
          <td>
            <table border="0">
              <tr class="athing" id="poll-1">
                <td></td>
                <td class="votelinks"><a href="vote?id=poll-1&amp;how=up&amp;goto=item%3Fid%3D123"><div class="votearrow"></div></a></td>
                <td class="comment"><div>First option</div></td>
              </tr>
              <tr>
                <td colspan="2"></td>
                <td class="default"><span class="comhead"><span class="score">11 points</span></span></td>
              </tr>
              <tr class="athing" id="poll-2">
                <td></td>
                <td class="votelinks"><a href="vote?id=poll-2&amp;how=up&amp;goto=item%3Fid%3D123"><div class="votearrow"></div></a></td>
                <td class="comment"><div>Second option</div></td>
              </tr>
              <tr>
                <td colspan="2"></td>
                <td class="default"><span class="comhead"><span class="score">7 points</span></span></td>
              </tr>
            </table>
            <table border="0">
              <tr class="athing" id="stray-row">
                <td></td>
                <td class="votelinks"><a href="vote?id=stray-row&amp;how=up&amp;goto=item%3Fid%3D123"><div class="votearrow"></div></a></td>
                <td class="comment"><div>Should not be parsed</div></td>
              </tr>
              <tr>
                <td colspan="2"></td>
                <td class="default"><span class="comhead"><span class="score">999 points</span></span></td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td colspan="2"></td>
          <td>
            <form action="comment" method="post">
              <input type="hidden" name="parent" value="123">
            </form>
          </td>
        </tr>
      </table>
      <table class="comment-tree"></table>
    `);

    const page = parseItemPage(doc);

    expect(page.pollOptions.map(option => option.id)).toEqual(['poll-1', 'poll-2']);
    expect(page.pollOptions.map(option => option.text)).toEqual(['First option', 'Second option']);
  });

  it('keeps poll-option unvotes scoped to the option instead of the main thread item', () => {
    const doc = parseHtmlDocument(`
      <table class="fatitem">
        <tr class="athing submission" id="48322267">
          <td class="title"><span class="rank"></span></td>
          <td class="votelinks">
            <a href="vote?id=48322267&amp;how=up&amp;goto=item%3Fid%3D48322267"><div class="votearrow"></div></a>
          </td>
          <td class="title">
            <span class="titleline"><a href="item?id=48322267">Example poll</a></span>
          </td>
        </tr>
        <tr>
          <td colspan="2"></td>
          <td class="subtext">
            <span class="subline">
              <span class="score" id="score_48322267">95 points</span>
              by <a href="user?id=ColinWright" class="hnuser">ColinWright</a>
              <span class="age" title="2026-05-29T12:31:59 1780057919"><a href="item?id=48322267">1 day ago</a></span>
              <span id="unv_48322267"></span>
            </span>
          </td>
        </tr>
        <tr>
          <td colspan="2"></td>
          <td><div class="toptext">Prompt</div></td>
        </tr>
        <tr>
          <td colspan="2"></td>
          <td>
            <table border="0">
              <tr class="athing" id="48322269">
                <td></td>
                <td class="votelinks"><a href="vote?id=48322269&amp;how=up&amp;goto=item%3Fid%3D48322267"><div class="votearrow"></div></a></td>
                <td class="comment"><div>Multiple times per day</div></td>
              </tr>
              <tr>
                <td colspan="2"></td>
                <td class="default"><span class="comhead"><span class="score">59 points</span><span id="unv_48322269"> | <a id="un_48322269" href="vote?id=48322269&amp;how=un&amp;goto=item%3Fid%3D48322267&amp;js=t">unvote</a></span></span></td>
              </tr>
              <tr class="athing" id="48322268">
                <td></td>
                <td class="votelinks"><a href="vote?id=48322268&amp;how=up&amp;goto=item%3Fid%3D48322267"><div class="votearrow"></div></a></td>
                <td class="comment"><div>Never</div></td>
              </tr>
              <tr>
                <td colspan="2"></td>
                <td class="default"><span class="comhead"><span class="score">261 points</span><span id="unv_48322268"></span></span></td>
              </tr>
              <tr class="athing" id="48322271">
                <td></td>
                <td class="votelinks"><a href="vote?id=48322271&amp;how=up&amp;goto=item%3Fid%3D48322267"><div class="votearrow"></div></a></td>
                <td class="comment"><div>Once a week</div></td>
              </tr>
              <tr>
                <td colspan="2"></td>
                <td class="default"><span class="comhead"><span class="score">88 points</span><span id="unv_48322271"></span></span></td>
              </tr>
              <tr class="athing" id="48322270">
                <td></td>
                <td class="votelinks"><a href="vote?id=48322270&amp;how=up&amp;goto=item%3Fid%3D48322267"><div class="votearrow"></div></a></td>
                <td class="comment"><div>Once a day</div></td>
              </tr>
              <tr>
                <td colspan="2"></td>
                <td class="default"><span class="comhead"><span class="score">38 points</span><span id="unv_48322270"></span></span></td>
              </tr>
              <tr class="athing" id="48322283">
                <td></td>
                <td class="votelinks"><a href="vote?id=48322283&amp;how=up&amp;goto=item%3Fid%3D48322267"><div class="votearrow"></div></a></td>
                <td class="comment"><div>Very rarely</div></td>
              </tr>
              <tr>
                <td colspan="2"></td>
                <td class="default"><span class="comhead"><span class="score">329 points</span><span id="unv_48322283"></span></span></td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td colspan="2"></td>
          <td>
            <form action="comment" method="post">
              <input type="hidden" name="parent" value="48322267">
            </form>
          </td>
        </tr>
      </table>
      <table class="comment-tree"></table>
    `);

    const page = parseItemPage(doc);

    expect(page.item.voteUn).toBeNull();
    expect(page.pollOptions.map(option => option.id)).toEqual([
      '48322269',
      '48322268',
      '48322271',
      '48322270',
      '48322283',
    ]);
    expect(page.pollOptions[0]).toMatchObject({
      id: '48322269',
      text: 'Multiple times per day',
      voteUn: 'vote?id=48322269&how=un&goto=item%3Fid%3D48322267&js=t',
    });
  });
});