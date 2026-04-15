import { readFile } from 'node:fs/promises';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { useHnActions } from '@/content/composables/use-hn-actions';

describe('useHnActions', () => {
  let dom: JSDOM;
  let fetchMock: ReturnType<typeof vi.fn>;
  let locationAssignMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    dom = new JSDOM('', { url: 'https://news.ycombinator.com/item?id=123' });
    locationAssignMock = vi.fn();
    Object.defineProperty(globalThis, 'window', {
      value: {
        location: {
          href: dom.window.location.href,
          assign: locationAssignMock,
        },
      },
      configurable: true,
    });

    fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      url: 'https://news.ycombinator.com/ok',
    });
    Object.defineProperty(globalThis, 'fetch', {
      value: fetchMock,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    dom.window.close();
    Reflect.deleteProperty(globalThis, 'window');
    Reflect.deleteProperty(globalThis, 'fetch');
  });

  it('submits upvotes with js=t and stores the derived unvote URL', async () => {
    const { submitVote } = useHnActions();
    const target = {
      voteUp: 'vote?id=10&how=up&auth=voteauth&goto=item%3Fid%3D123',
      voteDown: 'vote?id=10&how=down&auth=voteauth&goto=item%3Fid%3D123',
      voteUn: null,
    };

    await submitVote(target, target.voteUp, 'up');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://news.ycombinator.com/vote?id=10&how=up&auth=voteauth&goto=item%3Fid%3D123&js=t',
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        redirect: 'follow',
      }),
    );
    expect(target.voteUn).toBe('vote?id=10&how=un&auth=voteauth&goto=item%3Fid%3D123');
  });

  it('navigates to the HN vote login gate when a js vote returns the logged-out form', async () => {
    const fixtureUrl = new URL('../fixtures/vote-nologin.html', import.meta.url);
    const loggedOutVoteHtml = await readFile(fixtureUrl, 'utf8');
    fetchMock.mockResolvedValueOnce({
      ok: true,
      url: 'https://news.ycombinator.com/vote?id=47558997&how=up&goto=news&js=t',
      text: vi.fn().mockResolvedValue(loggedOutVoteHtml),
    });
    const { submitVote } = useHnActions();
    const target = {
      voteUp: 'vote?id=47558997&how=up&goto=news',
      voteDown: null,
      voteUn: null,
    };

    await expect(submitVote(target, target.voteUp, 'up')).resolves.toBe(false);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://news.ycombinator.com/vote?id=47558997&how=up&goto=news&js=t',
      expect.any(Object),
    );
    expect(locationAssignMock).toHaveBeenCalledWith(
      'https://news.ycombinator.com/vote?id=47558997&how=up&goto=news&js=t',
    );
    expect(target.voteUn).toBeNull();
  });

  it('fails closed for vote responses that do not resolve to HN ok', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      url: 'https://news.ycombinator.com/vote?id=10&how=up&auth=bad&goto=item%3Fid%3D123&js=t',
    });
    const { submitVote } = useHnActions();
    const target = {
      voteUp: 'vote?id=10&how=up&auth=bad&goto=item%3Fid%3D123',
      voteDown: null,
      voteUn: null,
    };

    await expect(submitVote(target, target.voteUp, 'up')).resolves.toBe(false);

    expect(locationAssignMock).toHaveBeenCalledWith(
      'https://news.ycombinator.com/vote?id=10&how=up&auth=bad&goto=item%3Fid%3D123&js=t',
    );
    expect(target.voteUn).toBeNull();
  });

  it('clears the stored unvote link after unvoting', async () => {
    const { submitVote } = useHnActions();
    const target = {
      voteUp: 'vote?id=10&how=up&auth=voteauth&goto=item%3Fid%3D123',
      voteDown: 'vote?id=10&how=down&auth=voteauth&goto=item%3Fid%3D123',
      voteUn: 'vote?id=10&how=un&auth=voteauth&goto=item%3Fid%3D123&js=t',
    };

    await submitVote(target, target.voteUn, 'un');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://news.ycombinator.com/vote?id=10&how=un&auth=voteauth&goto=item%3Fid%3D123&js=t',
      expect.any(Object),
    );
    expect(target.voteUn).toBeNull();
  });

  it('fails closed for blank vote hrefs', async () => {
    const { submitVote } = useHnActions();
    const target = {
      voteUp: null,
      voteDown: null,
      voteUn: null,
    };

    await expect(submitVote(target, '   ', 'up')).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(target.voteUn).toBeNull();
  });

  it('toggles flag state and derives the matching unflag URL', async () => {
    const { submitFlag } = useHnActions();
    const target = {
      flagUrl: 'flag?id=44&auth=flagauth&goto=item%3Fid%3D123',
      isFlagged: false,
    };

    await submitFlag(target);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://news.ycombinator.com/flag?id=44&auth=flagauth&goto=item%3Fid%3D123',
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
      }),
    );
    expect(target.isFlagged).toBe(true);
    expect(target.flagUrl).toBe('flag?id=44&auth=flagauth&goto=item%3Fid%3D123&un=t');
  });
});
