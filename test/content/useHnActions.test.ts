import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import { useHnActions } from '@/content/shared/useHnActions';

describe('useHnActions', () => {
  let dom: JSDOM;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    dom = new JSDOM('', { url: 'https://news.ycombinator.com/item?id=123' });
    Object.defineProperty(globalThis, 'window', {
      value: dom.window,
      configurable: true,
    });

    fetchMock = vi.fn().mockResolvedValue({ ok: true });
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