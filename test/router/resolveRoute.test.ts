import { describe, expect, it } from 'vitest';
import { resolveRoute } from '@/router';

function makeLocation(path: string): Location {
  return new URL(`https://news.ycombinator.com${path}`) as unknown as Location;
}

describe('resolveRoute', () => {
  it('routes newly enabled story list pages to the stories renderer', () => {
    for (const path of ['/asknew', '/classic', '/invited', '/launches']) {
      expect(resolveRoute(makeLocation(path))).toMatchObject({
        page: 'stories',
      });
    }
  });

  it('routes site filter pages to the stories renderer with the site filter intact', () => {
    expect(resolveRoute(makeLocation('/from?site=twitter.com'))).toEqual({
      page: 'stories',
      params: {
        type: 'from',
        site: 'twitter.com',
      },
    });
  });

  it('routes comment list variants to the flat comment renderer', () => {
    expect(resolveRoute(makeLocation('/bestcomments'))).toEqual({
      page: 'newcomments',
      params: {},
    });

    expect(resolveRoute(makeLocation('/highlights'))).toEqual({
      page: 'newcomments',
      params: {},
    });
  });

  it('routes latest thread views to the flat comment renderer', () => {
    expect(resolveRoute(makeLocation('/latest?id=42009039'))).toEqual({
      page: 'newcomments',
      params: { id: '42009039' },
    });
  });

  it('routes logged-out action gates to the login renderer', () => {
    expect(resolveRoute(makeLocation('/hide?id=42009039'))).toEqual({
      page: 'login',
      params: {},
    });

    expect(resolveRoute(makeLocation('/fave?id=42009039'))).toEqual({
      page: 'login',
      params: {},
    });
  });
});
