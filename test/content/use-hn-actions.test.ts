import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useHnActions } from '@/content/composables/use-hn-actions';
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

  it('submits upvotes with js=t and stores the derived unvote URL', async () => {
    const { submitVote } = useHnActions();
    const target = {
      voteState: {
        kind: 'available' as const,
        upHref: 'vote?id=10&how=up&auth=voteauth&goto=item%3Fid%3D123',
        downHref: 'vote?id=10&how=down&auth=voteauth&goto=item%3Fid%3D123',
      },
    };

    await submitVote(target, 'up');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://news.ycombinator.com/vote?id=10&how=up&auth=voteauth&goto=item%3Fid%3D123&js=t',
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
      unvoteHref: 'vote?id=10&how=un&auth=voteauth&goto=item%3Fid%3D123',
      upHref: 'vote?id=10&how=up&auth=voteauth&goto=item%3Fid%3D123',
      downHref: 'vote?id=10&how=down&auth=voteauth&goto=item%3Fid%3D123',
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

  it('fails closed without navigating when a js vote returns the logged-out form', async () => {
    const loggedOutVoteHtml = await loadFixtureHtml('misc/auth/vote-nologin.html');
    fetchMock.mockResolvedValueOnce({
      ok: true,
      url: 'https://news.ycombinator.com/vote?id=47558997&how=up&goto=news&js=t',
      text: vi.fn().mockResolvedValue(loggedOutVoteHtml),
    });
    const { submitVote } = useHnActions();
    const target = {
      voteState: {
        kind: 'available' as const,
        upHref: 'vote?id=47558997&how=up&goto=news',
        downHref: null,
      },
    };

    await expect(submitVote(target, 'up')).resolves.toBe(false);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://news.ycombinator.com/vote?id=47558997&how=up&goto=news&js=t',
      expect.any(Object),
    );
    expect(locationAssignMock).not.toHaveBeenCalled();
    expect(target.voteState.kind).toBe('available');
  });

  it('fails closed for vote responses that do not resolve to HN ok', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      type: 'basic',
      url: 'https://news.ycombinator.com/vote?id=10&how=up&auth=bad&goto=item%3Fid%3D123&js=t',
    });
    const { submitVote } = useHnActions();
    const target = {
      voteState: {
        kind: 'available' as const,
        upHref: 'vote?id=10&how=up&auth=bad&goto=item%3Fid%3D123',
        downHref: null,
      },
    };

    await expect(submitVote(target, 'up')).resolves.toBe(false);

    expect(locationAssignMock).not.toHaveBeenCalled();
    expect(target.voteState.kind).toBe('available');
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

  it('toggles favorite links through the centralized no-redirect request', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 302,
      type: 'basic',
      url: 'https://news.ycombinator.com/fave?id=44&auth=favauth&goto=item%3Fid%3D123',
    });
    const { submitFavorite } = useHnActions();
    const target = {
      favoriteAction: { kind: 'available' as const, href: 'fave?id=44&auth=favauth&goto=item%3Fid%3D123' },
    };

    await expect(submitFavorite(target)).resolves.toBe(true);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://news.ycombinator.com/fave?id=44&auth=favauth&goto=item%3Fid%3D123',
      expect.objectContaining({
        redirect: 'manual',
      }),
    );
    expect(locationAssignMock).not.toHaveBeenCalled();
    expect(target.favoriteAction).toEqual({
      kind: 'active',
      href: 'fave?id=44&auth=favauth&goto=item%3Fid%3D123&un=t',
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
