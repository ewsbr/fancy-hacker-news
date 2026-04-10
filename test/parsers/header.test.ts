import { describe, expect, it } from 'vitest';
import { JSDOM } from 'jsdom';
import { parseHeader } from '@/parsers/header';
import { loadFixtureDocument } from '../helpers/load-fixture';

describe('header parser', () => {
  it('parses the default top bar color from a standard fixture', async () => {
    const doc = await loadFixtureDocument('news.html');
    const header = parseHeader(doc);

    expect(header.topBarColor).toBe('#ff6600');
    expect(header.hasCustomTopBarColor).toBe(false);
    expect(header.hasMemorialBar).toBe(false);
    expect(header.memorialBarColor).toBeNull();
  });

  it('detects the memorial strip and preserves a custom top bar color', () => {
    const dom = new JSDOM(`
      <table id="hnmain">
        <tbody>
          <tr>
            <td bgcolor="#000000"><img src="s.gif" height="5" width="0"></td>
          </tr>
          <tr>
            <td bgcolor="#2FACED">
              <table>
                <tr>
                  <td></td>
                  <td>
                    <span class="pagetop">
                      <b class="hnname"><a href="news">Hacker News</a></b>
                      <a href="newest">new</a>
                    </span>
                  </td>
                  <td>
                    <span class="pagetop"><a href="login?goto=news">login</a></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    `);

    const header = parseHeader(dom.window.document);

    expect(header.topBarColor).toBe('#2faced');
    expect(header.hasCustomTopBarColor).toBe(true);
    expect(header.hasMemorialBar).toBe(true);
    expect(header.memorialBarColor).toBe('#000000');
  });

  it('supports query param overrides for top bar and memorial bar testing', () => {
    const dom = new JSDOM(`
      <table id="hnmain">
        <tbody>
          <tr>
            <td bgcolor="#ff6600">
              <table>
                <tr>
                  <td></td>
                  <td>
                    <span class="pagetop">
                      <b class="hnname"><a href="news">Hacker News</a></b>
                    </span>
                  </td>
                  <td>
                    <span class="pagetop"><a href="login?goto=news">login</a></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    `, {
      url: 'https://news.ycombinator.com/news?fhTopBarColor=2FACED&fhMemorialBar=1',
    });

    const header = parseHeader(dom.window.document);

    expect(header.topBarColor).toBe('#2faced');
    expect(header.hasCustomTopBarColor).toBe(true);
    expect(header.hasMemorialBar).toBe(true);
    expect(header.memorialBarColor).toBe('#000000');
  });

  it('supports disabling a source memorial strip via query param', () => {
    const dom = new JSDOM(`
      <table id="hnmain">
        <tbody>
          <tr>
            <td bgcolor="#000000"><img src="s.gif" height="5" width="0"></td>
          </tr>
          <tr>
            <td bgcolor="#ff6600">
              <table>
                <tr>
                  <td></td>
                  <td>
                    <span class="pagetop">
                      <b class="hnname"><a href="news">Hacker News</a></b>
                    </span>
                  </td>
                  <td>
                    <span class="pagetop"><a href="login?goto=news">login</a></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    `, {
      url: 'https://news.ycombinator.com/news?fhMemorialBar=0',
    });

    const header = parseHeader(dom.window.document);

    expect(header.hasMemorialBar).toBe(false);
    expect(header.memorialBarColor).toBeNull();
  });
});
