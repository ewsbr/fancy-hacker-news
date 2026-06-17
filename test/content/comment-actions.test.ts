// @vitest-environment jsdom

import type { ParsedHeader } from '@/parsers/header';
import { flushPromises } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import CommentActions from '@/content/components/comments/CommentActions.vue';
import { mountComponent } from '../helpers/mount-component';

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

describe('comment actions', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    window.history.pushState({}, '', 'https://news.ycombinator.com/item?id=123');

    fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 302,
      type: 'basic',
      url: 'https://news.ycombinator.com/vote?id=10&how=up&auth=voteauth&goto=item%3Fid%3D123%2310&js=t',
    });
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('lets logged-out comment vote links navigate to the HN login gate', () => {
    const target = {
      voteState: {
        kind: 'available' as const,
        upHref: 'vote?id=10&how=up&goto=item%3Fid%3D123%2310',
        downHref: null,
      },
    };
    const wrapper = mountComponent(CommentActions, {
      props: {
        voteState: target.voteState,
        voteTarget: target,
        replyLink: 'reply?id=10&goto=item%3Fid%3D123%2310',
      },
      global: {
        provide: {
          header: makeHeader(null),
        },
      },
    });

    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    wrapper.get('.comment-actions__vote--up').element.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('keeps logged-in comment votes in the background without browser navigation', async () => {
    const target = {
      voteState: {
        kind: 'available' as const,
        upHref: 'vote?id=10&how=up&auth=voteauth&goto=item%3Fid%3D123%2310',
        downHref: null,
      },
    };
    const wrapper = mountComponent(CommentActions, {
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
    wrapper.get('.comment-actions__vote--up').element.dispatchEvent(event);
    await flushPromises();

    expect(event.defaultPrevented).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://news.ycombinator.com/vote?id=10&how=up&auth=voteauth&goto=item%3Fid%3D123%2310&js=t',
      expect.objectContaining({
        redirect: 'manual',
      }),
    );
  });

  it('renders active downvotes with an undown label', () => {
    const wrapper = mountComponent(CommentActions, {
      props: {
        voteState: {
          kind: 'active',
          direction: 'down',
          unvoteHref: 'vote?id=10&how=un&auth=voteauth&goto=item%3Fid%3D123%2310',
          upHref: 'vote?id=10&how=up&auth=voteauth&goto=item%3Fid%3D123%2310',
          downHref: 'vote?id=10&how=down&auth=voteauth&goto=item%3Fid%3D123%2310',
        },
        voteTarget: {
          voteState: {
            kind: 'active',
            direction: 'down',
            unvoteHref: 'vote?id=10&how=un&auth=voteauth&goto=item%3Fid%3D123%2310',
            upHref: 'vote?id=10&how=up&auth=voteauth&goto=item%3Fid%3D123%2310',
            downHref: 'vote?id=10&how=down&auth=voteauth&goto=item%3Fid%3D123%2310',
          },
        },
      },
    });

    expect(wrapper.get('.comment-actions__vote--active').text()).toContain('undown');
  });

  it('renders disabled active votes as non-clickable state text', () => {
    const wrapper = mountComponent(CommentActions, {
      props: {
        voteState: {
          kind: 'disabled-active',
          direction: 'unknown',
          upHref: 'vote?id=10&how=up&auth=voteauth&goto=item%3Fid%3D123%2310',
          downHref: null,
        },
      },
    });

    expect(wrapper.find('a.comment-actions__vote').exists()).toBe(false);
    expect(wrapper.get('.comment-actions__vote--disabled').text()).toContain('voted');
  });

  it('keeps reply links as native HN navigation', () => {
    const wrapper = mountComponent(CommentActions, {
      props: {
        replyLink: 'reply?id=10&goto=item%3Fid%3D123%2310',
      },
      global: {
        provide: {
          header: makeHeader(null),
        },
      },
    });

    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    wrapper.get('.comment-actions__link').element.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
