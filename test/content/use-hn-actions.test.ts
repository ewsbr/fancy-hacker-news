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
        redirect: 'manual',
      }),
    );
    expect(target.voteUn).toBe('vote?id=10&how=un&auth=voteauth&goto=item%3Fid%3D123');
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
      voteUp: 'vote?id=10&how=up&auth=voteauth&goto=item%3Fid%3D123',
      voteDown: null,
      voteUn: null,
    };

    await expect(submitVote(target, target.voteUp, 'up')).resolves.toBe(true);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://news.ycombinator.com/vote?id=10&how=up&auth=voteauth&goto=item%3Fid%3D123&js=t',
      expect.objectContaining({
        redirect: 'manual',
      }),
    );
    expect(locationAssignMock).not.toHaveBeenCalled();
    expect(target.voteUn).toBe('vote?id=10&how=un&auth=voteauth&goto=item%3Fid%3D123');
  });

  it('fails closed without navigating when a js vote returns the logged-out form', async () => {
    const loggedOutVoteHtml = await loadFixtureHtml('vote-nologin.html');
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
    expect(locationAssignMock).not.toHaveBeenCalled();
    expect(target.voteUn).toBeNull();
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
      voteUp: 'vote?id=10&how=up&auth=bad&goto=item%3Fid%3D123',
      voteDown: null,
      voteUn: null,
    };

    await expect(submitVote(target, target.voteUp, 'up')).resolves.toBe(false);

    expect(locationAssignMock).not.toHaveBeenCalled();
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
        redirect: 'manual',
      }),
    );
    expect(target.isFlagged).toBe(true);
    expect(target.flagUrl).toBe('flag?id=44&auth=flagauth&goto=item%3Fid%3D123&un=t');
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
      flagUrl: 'flag?id=44&auth=flagauth&goto=item%3Fid%3D123',
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
      favoriteUrl: 'fave?id=44&auth=favauth&goto=item%3Fid%3D123',
    };

    await expect(submitFavorite(target)).resolves.toBe(true);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://news.ycombinator.com/fave?id=44&auth=favauth&goto=item%3Fid%3D123',
      expect.objectContaining({
        redirect: 'manual',
      }),
    );
    expect(locationAssignMock).not.toHaveBeenCalled();
    expect(target.favoriteUrl).toBe('fave?id=44&auth=favauth&goto=item%3Fid%3D123&un=t');
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
      hideUrl: 'hide?id=44&auth=hideauth&goto=news',
    };

    await expect(submitHide(target)).resolves.toBe(true);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://news.ycombinator.com/hide?id=44&auth=hideauth&goto=news',
      expect.objectContaining({
        redirect: 'manual',
      }),
    );
    expect(locationAssignMock).not.toHaveBeenCalled();
    expect(target.hideUrl).toBe('hide?id=44&auth=hideauth&goto=news&un=t');
  });
});
