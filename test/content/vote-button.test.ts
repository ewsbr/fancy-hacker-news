// @vitest-environment jsdom

import { flushPromises } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import VoteButton from '@/content/components/stories/VoteButton.vue';
import { mountComponent } from '../helpers/mount-component';

describe('VoteButton', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    window.history.pushState({}, '', 'https://news.ycombinator.com/item?id=123');

    fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 302,
      type: 'basic',
      url: 'https://news.ycombinator.com/vote?id=10&how=up&auth=voteauth&goto=item%3Fid%3D123&js=t',
    });
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('switches to the unvote state after a successful upvote response', async () => {
    const target = {
      voteUp: 'vote?id=10&how=up&auth=voteauth&goto=item%3Fid%3D123',
      voteUn: null,
    };
    const wrapper = mountComponent(VoteButton, {
      props: {
        href: target.voteUp,
        voteUnHref: target.voteUn,
        voteTarget: target,
      },
    });

    await wrapper.get('a.vote-btn').trigger('click');
    await flushPromises();

    const link = wrapper.get('a.vote-btn');
    expect(link.classes()).toContain('vote-btn--active');
    expect(link.attributes('title')).toBe('unvote');
    expect(link.attributes('href')).toBe('vote?id=10&how=un&auth=voteauth&goto=item%3Fid%3D123');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://news.ycombinator.com/vote?id=10&how=up&auth=voteauth&goto=item%3Fid%3D123&js=t',
      expect.objectContaining({
        redirect: 'manual',
      }),
    );
  });
});
