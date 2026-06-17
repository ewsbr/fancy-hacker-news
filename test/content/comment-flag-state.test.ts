// @vitest-environment jsdom

import type { CommentNode as CommentNodeType } from '@/parsers/item';
import { flushPromises } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, markRaw } from 'vue';
import CommentNode from '@/content/components/comments/CommentNode.vue';
import { provideCommentActionStateRegistry } from '@/content/composables/comment-node';
import { mountComponent } from '../helpers/mount-component';

const FLAG_URL = 'flag?id=10&auth=flagauth&goto=item%3Fid%3D123%2310';
const UNFLAG_URL = 'flag?id=10&auth=flagauth&goto=item%3Fid%3D123%2310&un=t';
const VOTE_URL = 'vote?id=10&how=up&auth=voteauth&goto=item%3Fid%3D123%2310';
const UNVOTE_URL = 'vote?id=10&how=un&auth=voteauth&goto=item%3Fid%3D123%2310';

function makeCommentNode(): CommentNodeType {
  const children: CommentNodeType[] = [];

  return markRaw({
    id: '10',
    author: 'dang',
    authorIsNew: false,
    score: null,
    age: '1 hour ago',
    ageTimestamp: '2026-04-06T00:01:00.000Z',
    ageLink: 'item?id=10',
    bodyHtml: '<p>Flaggable comment</p>',
    placeholderKind: null,
    grayLevel: null,
    indent: 0,
    isCollapsed: false,
    isDead: false,
    isFlagged: false,
    collapsedCount: 0,
    voteState: { kind: 'unavailable' },
    flagAction: { kind: 'available', href: FLAG_URL },
    editUrl: null,
    deleteUrl: null,
    replyLink: null,
    isDeleted: false,
    descendantCount: 0,
    expandForHash: false,
    navLinks: markRaw({
      root: null,
      parent: null,
      prev: null,
      next: null,
      context: null,
    }),
    children: markRaw(children),
    lazyThread: null,
  });
}

function mountDuplicatedCommentNode(node: CommentNodeType) {
  const Harness = defineComponent({
    name: 'CommentFlagStateHarness',
    setup() {
      provideCommentActionStateRegistry();

      return () => h('div', [
        h(CommentNode, { node }),
        h(CommentNode, { node }),
      ]);
    },
  });

  return mountComponent(Harness);
}

describe('comment flag state', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    window.history.pushState({}, '', 'https://news.ycombinator.com/item?id=123');
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 302,
      type: 'basic',
      url: `https://news.ycombinator.com/${FLAG_URL}`,
    });
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('updates comment flag label, href, and badge through sidecar state', async () => {
    const node = makeCommentNode();
    const wrapper = mountDuplicatedCommentNode(node);

    expect(wrapper.findAll('.flag-button').map(button => button.text())).toEqual(['flag', 'flag']);
    expect(wrapper.findAll('.badge--flagged')).toHaveLength(0);

    await wrapper.find('.flag-button').trigger('click');
    await flushPromises();

    const buttons = wrapper.findAll('.flag-button');
    expect(buttons.map(button => button.text())).toEqual(['unflag', 'unflag']);
    expect(buttons.map(button => button.attributes('href'))).toEqual([UNFLAG_URL, UNFLAG_URL]);
    expect(wrapper.findAll('.badge--flagged')).toHaveLength(2);
    expect(node.flagAction).toEqual({ kind: 'available', href: FLAG_URL });
    expect(node.isFlagged).toBe(false);
    expect(fetchMock).toHaveBeenCalledWith(
      `https://news.ycombinator.com/${FLAG_URL}`,
      expect.objectContaining({
        redirect: 'manual',
      }),
    );
  });

  it('updates duplicated comment vote controls through sidecar state', async () => {
    const node = makeCommentNode();
    node.voteState = {
      kind: 'available',
      upHref: VOTE_URL,
      downHref: null,
    };
    node.flagAction = { kind: 'unavailable' };
    const wrapper = mountDuplicatedCommentNode(node);

    expect(wrapper.findAll('.comment-actions__vote--up').map(button => button.text())).toEqual(['upvote', 'upvote']);

    await wrapper.find('.comment-actions__vote--up').trigger('click');
    await flushPromises();

    const buttons = wrapper.findAll('.comment-actions__vote--active');
    expect(buttons.map(button => button.text())).toEqual(['unvote', 'unvote']);
    expect(buttons.map(button => button.attributes('href'))).toEqual([UNVOTE_URL, UNVOTE_URL]);
    expect(node.voteState).toEqual({
      kind: 'available',
      upHref: VOTE_URL,
      downHref: null,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      `https://news.ycombinator.com/${VOTE_URL}&js=t`,
      expect.objectContaining({
        redirect: 'manual',
      }),
    );
  });
});
