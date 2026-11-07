import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useHnActions } from '@/content/composables/use-hn-actions';
import { makeRequestHnActionMessage } from '@/utils/extension-messages';
import { loadFixtureHtml } from '../helpers/load-fixture';

describe('useHnActions', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let locationAssignMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    locationAssignMock = vi.fn();
    vi.stubGlobal('window', {
      location: {
        href: 'https://news.ycombinator.com/item?id=123',
        assign: locationAssignMock,
      },
    });

    fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      type: 'basic',
      url: 'https://news.ycombinator.com/ok',
    });
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it.each(['vote', 'votex'])('submits %s upvotes with js=t and stores the derived unvote URL', async (endpoint) => {
    const { submitVote } = useHnActions();
    const target = {
      voteState: {
        kind: 'available' as const,
        upHref: `${endpoint}?id=10&how=up&auth=voteauth&goto=item%3Fid%3D123`,
        downHref: `${endpoint}?id=10&how=down&auth=voteauth&goto=item%3Fid%3D123`,
      },
    };

    await submitVote(target, 'up');

    expect(fetchMock).toHaveBeenCalledWith(
      `https://news.ycombinator.com/${endpoint}?id=10&how=up&auth=voteauth&goto=item%3Fid%3D123&js=t`,
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
        cache: 'no-store',
        redirect: 'manual',
      }),
    );
    expect(target.voteState).toEqual({
      kind: 'active',
      direction: 'up',
      unvoteHref: `${endpoint}?id=10&how=un&auth=voteauth&goto=item%3Fid%3D123`,
      upHref: `${endpoint}?id=10&how=up&auth=voteauth&goto=item%3Fid%3D123`,
      downHref: `${endpoint}?id=10&how=down&auth=voteauth&goto=item%3Fid%3D123`,
    });
  });

  it('treats manual vote redirects as success without following them', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 302,
      type: 'basic',
      url: 'https://news.ycombinator.com/vote?id=10&how=up&auth=voteauth&goto=item%3Fid%3D123&js=t',
    });
    const { submitVote } = useHnActions();
    const target = {
      voteState: {
        kind: 'available' as const,
        upHref: 'vote?id=10&how=up&auth=voteauth&goto=item%3Fid%3D123',
        downHref: null,
      },
    };

    await expect(submitVote(target, 'up')).resolves.toBe(true);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://news.ycombinator.com/vote?id=10&how=up&auth=voteauth&goto=item%3Fid%3D123&js=t',
      expect.objectContaining({
        redirect: 'manual',
      }),
    );
    expect(locationAssignMock).not.toHaveBeenCalled();
    expect(target.voteState).toMatchObject({
      kind: 'active',
      unvoteHref: 'vote?id=10&how=un&auth=voteauth&goto=item%3Fid%3D123',
    });
  });

  function stubBackgroundResponse(response: unknown) {
    const sendMessage = vi.fn((_message: unknown, callback: (response: unknown) => void) => {
      callback(response);
    });
    vi.stubGlobal('chrome', { runtime: { sendMessage } });
    return sendMessage;
  }

  async function mockLoggedOutVoteResponse() {
    const loggedOutVoteHtml = await loadFixtureHtml('misc/auth/vote-nologin.html');
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      type: 'basic',
      url: 'https://news.ycombinator.com/vote?id=47558997&how=up&goto=news&js=t',
      text: vi.fn().mockResolvedValue(loggedOutVoteHtml),
    });
  }

  function makeLoggedOutVoteTarget() {
    return {
      voteState: {
        kind: 'available' as const,
        upHref: 'vote?id=47558997&how=up&goto=news',
        downHref: null,
      },
    };
  }

  it('retries a vote HN rejected through the background script', async () => {
    await mockLoggedOutVoteResponse();
    const sendMessage = stubBackgroundResponse({ ok: true, result: 'accepted' });
    const { submitVote } = useHnActions();
    const target = makeLoggedOutVoteTarget();

    await expect(submitVote(target, 'up')).resolves.toBe(true);

    expect(sendMessage).toHaveBeenCalledWith(
      makeRequestHnActionMessage('https://news.ycombinator.com/vote?id=47558997&how=up&goto=news&js=t'),
      expect.any(Function),
    );
    expect(locationAssignMock).not.toHaveBeenCalled();
    expect(target.voteState.kind).toBe('active');
  });

  it('navigates to the native vote URL when the background request is rejected too', async () => {
    await mockLoggedOutVoteResponse();
    stubBackgroundResponse({ ok: true, result: 'rejected' });
    const { submitVote } = useHnActions();
    const target = makeLoggedOutVoteTarget();

    await expect(submitVote(target, 'up')).resolves.toBe(false);

    expect(locationAssignMock).toHaveBeenCalledWith('https://news.ycombinator.com/vote?id=47558997&how=up&goto=news');
    expect(target.voteState.kind).toBe('available');
  });

  it('neither retries nor navigates when the request does not reach HN', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    fetchMock.mockRejectedValueOnce(new TypeError('NetworkError when attempting to fetch resource.'));
    const sendMessage = stubBackgroundResponse({ ok: true, result: 'accepted' });
    const { submitVote } = useHnActions();
    const target = makeLoggedOutVoteTarget();

    await expect(submitVote(target, 'up')).resolves.toBe(false);

    expect(sendMessage).not.toHaveBeenCalled();
    expect(locationAssignMock).not.toHaveBeenCalled();
  });

  it('clears the stored unvote link after unvoting', async () => {
    const { submitVote } = useHnActions();
    const target = {
      voteState: {
        kind: 'active' as const,
        direction: 'up' as const,
        unvoteHref: 'vote?id=10&how=un&auth=voteauth&goto=item%3Fid%3D123&js=t',
        upHref: 'vote?id=10&how=up&auth=voteauth&goto=item%3Fid%3D123',
        downHref: 'vote?id=10&how=down&auth=voteauth&goto=item%3Fid%3D123',
      },
    };

    await submitVote(target, 'un');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://news.ycombinator.com/vote?id=10&how=un&auth=voteauth&goto=item%3Fid%3D123&js=t',
      expect.any(Object),
    );
    expect(target.voteState).toEqual({
      kind: 'available',
      upHref: 'vote?id=10&how=up&auth=voteauth&goto=item%3Fid%3D123',
      downHref: 'vote?id=10&how=down&auth=voteauth&goto=item%3Fid%3D123',
    });
  });

  it('fails closed for blank vote hrefs', async () => {
    const { submitVote } = useHnActions();
    const target = {
      voteState: { kind: 'unavailable' as const },
    };

    await expect(submitVote(target, 'up')).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(target.voteState.kind).toBe('unavailable');
  });

  it('does not submit disabled active vote states', async () => {
    const { submitVote } = useHnActions();
    const target = {
      voteState: {
        kind: 'disabled-active' as const,
        direction: 'up' as const,
        upHref: 'vote?id=10&how=up&auth=voteauth&goto=item%3Fid%3D123',
        downHref: null,
      },
    };

    await expect(submitVote(target, 'up')).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('toggles flag state and derives the matching unflag URL', async () => {
    const { submitFlag } = useHnActions();
    const target = {
      flagAction: { kind: 'available' as const, href: 'flag?id=44&auth=flagauth&goto=item%3Fid%3D123' },
      isFlagged: false,
    };

    await submitFlag(target);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://news.ycombinator.com/flag?id=44&auth=flagauth&goto=item%3Fid%3D123',
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
        redirect: 'manual',
      }),
    );
    expect(target.isFlagged).toBe(true);
    expect(target.flagAction).toEqual({
      kind: 'active',
      href: 'flag?id=44&auth=flagauth&goto=item%3Fid%3D123&un=t',
    });
  });

  it('treats manual flag redirects as success without following them', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 302,
      type: 'basic',
      url: 'https://news.ycombinator.com/flag?id=44&auth=flagauth&goto=item%3Fid%3D123',
    });
    const { submitFlag } = useHnActions();
    const target = {
      flagAction: { kind: 'available' as const, href: 'flag?id=44&auth=flagauth&goto=item%3Fid%3D123' },
      isFlagged: false,
    };

    await expect(submitFlag(target)).resolves.toBe(true);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://news.ycombinator.com/flag?id=44&auth=flagauth&goto=item%3Fid%3D123',
      expect.objectContaining({
        redirect: 'manual',
      }),
    );
    expect(locationAssignMock).not.toHaveBeenCalled();
    expect(target.isFlagged).toBe(true);
  });

  it.each(['fave', 'favex'])('toggles %s links and submits undo to the same endpoint', async (endpoint) => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 302,
      type: 'basic',
      url: `https://news.ycombinator.com/${endpoint}?id=44&auth=favauth&goto=item%3Fid%3D123`,
    });
    const { submitFavorite } = useHnActions();
    const target = {
      favoriteAction: { kind: 'available' as const, href: `${endpoint}?id=44&auth=favauth&goto=item%3Fid%3D123` },
    };

    await expect(submitFavorite(target)).resolves.toBe(true);

    expect(fetchMock).toHaveBeenCalledWith(
      `https://news.ycombinator.com/${endpoint}?id=44&auth=favauth&goto=item%3Fid%3D123`,
      expect.objectContaining({
        redirect: 'manual',
      }),
    );
    expect(locationAssignMock).not.toHaveBeenCalled();
    expect(target.favoriteAction).toEqual({
      kind: 'active',
      href: `${endpoint}?id=44&auth=favauth&goto=item%3Fid%3D123&un=t`,
    });

    await expect(submitFavorite(target)).resolves.toBe(true);

    expect(fetchMock).toHaveBeenLastCalledWith(
      `https://news.ycombinator.com/${endpoint}?id=44&auth=favauth&goto=item%3Fid%3D123&un=t`,
      expect.objectContaining({ redirect: 'manual' }),
    );
    expect(target.favoriteAction).toEqual({
      kind: 'available',
      href: `${endpoint}?id=44&auth=favauth&goto=item%3Fid%3D123`,
    });
  });

  it('toggles hide links through the centralized no-redirect request', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 302,
      type: 'basic',
      url: 'https://news.ycombinator.com/hide?id=44&auth=hideauth&goto=news',
    });
    const { submitHide } = useHnActions();
    const target = {
      hideAction: { kind: 'available' as const, href: 'hide?id=44&auth=hideauth&goto=news' },
    };

    await expect(submitHide(target)).resolves.toBe(true);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://news.ycombinator.com/hide?id=44&auth=hideauth&goto=news',
      expect.objectContaining({
        redirect: 'manual',
      }),
    );
    expect(locationAssignMock).not.toHaveBeenCalled();
    expect(target.hideAction).toEqual({
      kind: 'active',
      href: 'hide?id=44&auth=hideauth&goto=news&un=t',
    });
  });
});
