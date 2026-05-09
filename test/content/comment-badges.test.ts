import type { CommentNode } from '@/parsers/item';
import { describe, expect, it } from 'vitest';
import { getOriginalPosterTitle } from '@/content/utils/comment-badges';
import { parseItemPage } from '@/parsers/item';
import { loadFixtureDocument } from '../helpers/load-fixture';

function findCommentWithParent(
  comments: CommentNode[],
  targetId: string,
  parentAuthor: string | null = null,
): { node: CommentNode; parentAuthor: string | null } | null {
  for (const comment of comments) {
    if (comment.id === targetId) {
      return { node: comment, parentAuthor };
    }

    const childMatch = findCommentWithParent(comment.children, targetId, comment.author);
    if (childMatch) {
      return childMatch;
    }
  }

  return null;
}

describe('comment OP badges', () => {
  it('marks story authors as OP', () => {
    expect(getOriginalPosterTitle({
      author: 'j0rg3',
      storyAuthor: 'j0rg3',
    })).toBe('Story author');
  });

  it('marks thread authors as OP across a comment thread', () => {
    expect(getOriginalPosterTitle({
      author: 'binsquare',
      threadAuthor: 'binsquare',
    })).toBe('Thread author');
  });

  it('marks direct parent authors as OP', () => {
    expect(getOriginalPosterTitle({
      author: 'consumer451',
      parentAuthor: 'consumer451',
    })).toBe('Parent author');
  });

  it('keeps the combined title when both conditions match', () => {
    expect(getOriginalPosterTitle({
      author: 'j0rg3',
      storyAuthor: 'j0rg3',
      threadAuthor: 'j0rg3',
      parentAuthor: 'j0rg3',
    })).toBe('Story author and Thread author and Parent author');
  });

  it('does not mark unrelated commenters', () => {
    expect(getOriginalPosterTitle({
      author: 'oceliker',
      storyAuthor: 'j0rg3',
      parentAuthor: 'consumer451',
    })).toBeNull();
  });

  it('keeps thread-author OP badges working on comment permalink pages', async () => {
    const doc = await loadFixtureDocument('story-comment-thread-op.html');
    const page = parseItemPage(doc);
    const threadAuthor = page.item.author;
    const rootTitle = getOriginalPosterTitle({
      author: page.item.author,
      threadAuthor,
    });
    const threadAuthorReply = findCommentWithParent(page.comments, '47810874');
    const unrelatedReply = findCommentWithParent(page.comments, '47814091');

    expect(rootTitle).toBe('Thread author');
    expect(threadAuthorReply).not.toBeNull();
    expect(unrelatedReply).not.toBeNull();
    expect(getOriginalPosterTitle({
      author: threadAuthorReply!.node.author,
      threadAuthor,
      parentAuthor: threadAuthorReply!.parentAuthor,
    })).toBe('Thread author');
    expect(getOriginalPosterTitle({
      author: unrelatedReply!.node.author,
      threadAuthor,
      parentAuthor: unrelatedReply!.parentAuthor,
    })).toBeNull();
  });
});
