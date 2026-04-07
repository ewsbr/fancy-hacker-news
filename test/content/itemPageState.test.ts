import { describe, expect, it } from 'vitest';
import { isReactive } from 'vue';
import type { ParsedItemPage } from '@/parsers/item';
import {
  createCommentActionStateStore,
  getCommentActionState,
  makeItemPageReactive,
} from '@/state/itemPageState';

function buildItemPage(): ParsedItemPage {
  return {
    item: {
      id: 'story-1',
      type: 'story',
      title: 'Example story',
      url: 'https://example.com/story',
      site: 'example.com',
      score: 12,
      author: 'pg',
      authorIsNew: false,
      age: '1 hour ago',
      ageTimestamp: '2026-04-06T00:00:00.000Z',
      ageLink: 'item?id=story-1',
      bodyHtml: null,
      placeholderKind: null,
      parentLink: null,
      contextLink: null,
      storyTitle: null,
      storyLink: null,
      voteUp: 'vote?id=story-1&how=up',
      voteDown: null,
      voteUn: null,
      hideUrl: null,
      pastUrl: null,
      favoriteUrl: null,
      flagUrl: 'flag?id=story-1',
      isDead: false,
      isFlagged: false,
      isDeleted: false,
    },
    pollOptions: [],
    comments: [
      {
        id: 'comment-1',
        author: 'dang',
        authorIsNew: false,
        score: 10,
        age: '59 minutes ago',
        ageTimestamp: '2026-04-06T00:01:00.000Z',
        ageLink: 'item?id=comment-1',
        bodyHtml: '<p>Parent comment</p>',
        placeholderKind: null,
        grayLevel: null,
        indent: 0,
        isCollapsed: false,
        isDead: false,
        isFlagged: false,
        collapsedCount: 0,
        voteUp: 'vote?id=comment-1&how=up',
        voteDown: null,
        voteUn: null,
        flagUrl: 'flag?id=comment-1',
        editUrl: null,
        deleteUrl: null,
        replyLink: 'reply?id=comment-1',
        isDeleted: false,
        descendantCount: 1,
        expandForHash: false,
        navLinks: {
          root: '#comment-1',
          parent: null,
          prev: null,
          next: '#comment-2',
          context: null,
        },
        children: [
          {
            id: 'comment-2',
            author: 'sama',
            authorIsNew: false,
            score: 4,
            age: '30 minutes ago',
            ageTimestamp: '2026-04-06T00:30:00.000Z',
            ageLink: 'item?id=comment-2',
            bodyHtml: '<p>Child comment</p>',
            placeholderKind: null,
            grayLevel: null,
            indent: 1,
            isCollapsed: false,
            isDead: false,
            isFlagged: true,
            collapsedCount: 0,
            voteUp: 'vote?id=comment-2&how=up',
            voteDown: 'vote?id=comment-2&how=down',
            voteUn: 'vote?id=comment-2&how=un',
            flagUrl: 'flag?id=comment-2&un=t',
            editUrl: null,
            deleteUrl: null,
            replyLink: 'reply?id=comment-2',
            isDeleted: false,
            descendantCount: 0,
            expandForHash: false,
            navLinks: {
              root: '#comment-1',
              parent: '#comment-1',
              prev: null,
              next: null,
              context: '#comment-2',
            },
            children: [],
          },
        ],
      },
    ],
    replyForm: null,
  };
}

describe('itemPageState', () => {
  it('keeps the item page shell reactive while leaving the parsed comment tree raw', () => {
    const pageData = buildItemPage();
    const reactivePageData = makeItemPageReactive(pageData);

    expect(isReactive(reactivePageData)).toBe(true);
    expect(isReactive(reactivePageData.item)).toBe(true);
    expect(isReactive(reactivePageData.comments)).toBe(false);
    expect(isReactive(reactivePageData.comments[0])).toBe(false);
    expect(isReactive(reactivePageData.comments[0].children)).toBe(false);
    expect(isReactive(reactivePageData.comments[0].children[0])).toBe(false);
    expect(isReactive(reactivePageData.comments[0].navLinks)).toBe(false);
  });

  it('reuses reactive action islands per comment id', () => {
    const pageData = buildItemPage();
    const store = createCommentActionStateStore();

    const firstState = getCommentActionState(store, pageData.comments[0]);
    firstState.voteUn = 'vote?id=comment-1&how=un';
    firstState.flagUrl = 'flag?id=comment-1&un=t';
    firstState.isFlagged = true;

    const secondState = getCommentActionState(store, pageData.comments[0]);

    expect(firstState).toBe(secondState);
    expect(secondState.voteUn).toBe('vote?id=comment-1&how=un');
    expect(secondState.flagUrl).toBe('flag?id=comment-1&un=t');
    expect(secondState.isFlagged).toBe(true);
  });
});
