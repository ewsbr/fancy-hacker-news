// @vitest-environment jsdom

import type { ParsedHeader } from '@/parsers/header';
import { flushPromises } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import VoteButton from '@/content/components/stories/VoteButton.vue';
import { mountComponent } from '../helpers/mount-component';

describe('vote button', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  function makeHeader(user: ParsedHeader['user']): ParsedHeader {
    return {
      navLinks: [],
      hasAuthControls: true,
      user,
      loginUrl: user == null ? 'login?goto=news' : null,
      logoutUrl: user == null ? null : 'logout?auth=logoutauth',
      topBarColor: '#ff6600',
      hasCustomTopBarColor: false,
      hasMemorialBar: false,
      memorialBarColor: null,
    };
  }

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
      voteState: {
        kind: 'available' as const,
        upHref: 'vote?id=10&how=up&auth=voteauth&goto=item%3Fid%3D123',
        downHref: null,
      },
    };
    const wrapper = mountComponent(VoteButton, {
      props: {
        voteState: target.voteState,
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

  it('lets logged-out upvote links navigate to the HN login gate', () => {
    const target = {
      voteState: {
        kind: 'available' as const,
        upHref: 'vote?id=10&how=up&goto=item%3Fid%3D123',
        downHref: null,
      },
    };
    const wrapper = mountComponent(VoteButton, {
      props: {
        voteState: target.voteState,
        voteTarget: target,
      },
      global: {
        provide: {
          header: makeHeader(null),
        },
      },
    });

    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    wrapper.get('a.vote-btn').element.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('keeps logged-in upvotes in the background without browser navigation', async () => {
    const target = {
      voteState: {
        kind: 'available' as const,
        upHref: 'vote?id=10&how=up&auth=voteauth&goto=item%3Fid%3D123',
        downHref: null,
      },
    };
    const wrapper = mountComponent(VoteButton, {
      props: {
        voteState: target.voteState,
        voteTarget: target,
      },
      global: {
        provide: {
          header: makeHeader({ name: 'ews', karma: 123 }),
        },
      },
    });

    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    wrapper.get('a.vote-btn').element.dispatchEvent(event);
    await flushPromises();

    expect(event.defaultPrevented).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://news.ycombinator.com/vote?id=10&how=up&auth=voteauth&goto=item%3Fid%3D123&js=t',
      expect.objectContaining({
        redirect: 'manual',
      }),
    );
  });

  it('renders disabled active votes without a clickable link', () => {
    const wrapper = mountComponent(VoteButton, {
      props: {
        voteState: {
          kind: 'disabled-active',
          direction: 'up',
          upHref: 'vote?id=10&how=up&auth=voteauth&goto=item%3Fid%3D123',
          downHref: null,
        },
        voteTarget: {
          voteState: {
            kind: 'disabled-active',
            direction: 'up',
            upHref: 'vote?id=10&how=up&auth=voteauth&goto=item%3Fid%3D123',
            downHref: null,
          },
        },
      },
    });

    expect(wrapper.find('a.vote-btn').exists()).toBe(false);
    expect(wrapper.get('.vote-btn--disabled').attributes('title')).toBe('upvoted');
  });
});
