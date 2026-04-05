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
});