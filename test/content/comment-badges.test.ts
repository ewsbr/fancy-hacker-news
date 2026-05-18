import type { CommentNode } from '@/parsers/item';
import { describe, expect, it } from 'vitest';
import { createApp, ref } from 'vue';
import { useCommentDisplayContext } from '@/content/composables/comment-node';
import {
  COMMENT_THREAD_ROOT_AUTHOR_KEY,
  COMMENT_THREAD_STORY_AUTHOR_KEY,
  getOriginalPosterTitle,
} from '@/content/utils/comment-badges';
import { parseItemPage } from '@/parsers/item';
import { loadFixtureDocument } from '../helpers/load-fixture';

function getDisplayContextTitle(options: {
  author: string;
  parentAuthor?: string | null;
  storyAuthor?: string | null;
  threadRootAuthor?: string | null;
}): string | null {
  let title: string | null = null;

  const app = createApp({ render: () => null });

  app.provide(COMMENT_THREAD_STORY_AUTHOR_KEY, options.storyAuthor ?? null);
  app.provide(COMMENT_THREAD_ROOT_AUTHOR_KEY, options.threadRootAuthor ?? null);
  app.runWithContext(() => {
    const node = ref({
      id: 'comment-id',
      author: options.author,
      indent: 1,
    } as CommentNode);
    const context = useCommentDisplayContext({
      node,
      parentAuthor: ref(options.parentAuthor ?? null),
      threadAuthor: ref(null),
      showLocalThreadAuthor: ref(false),
      showOnStory: ref(false),
      rootVariant: ref('default'),
    });

    title = context.originalPosterTitle.value;
  });

  return title;
}

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

async function getFixtureCommentOriginalPosterTitle(
  fixturePath: string,
  targetId: string,
): Promise<string | null> {
  const doc = await loadFixtureDocument(fixturePath);
  const page = parseItemPage(doc);
  const match = findCommentWithParent(page.comments, targetId);

  expect(match).not.toBeNull();

  return getDisplayContextTitle({
    author: match!.node.author,
    parentAuthor: match!.parentAuthor,
    storyAuthor: page.item.type === 'story' ? page.item.author : null,
    threadRootAuthor: page.item.type === 'comment' ? page.item.author : null,
  });
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

  it('does not mark commenters as OP on story pages just because they own a parent comment', async () => {
    await expect(getFixtureCommentOriginalPosterTitle(
      'comments/scenarios/parent-story-not-op.html',
      '48016906',
    )).resolves.toBeNull();
  });

  it('marks the root comment author as OP on comment permalink pages', async () => {
    await expect(getFixtureCommentOriginalPosterTitle(
      'comments/scenarios/parent-comment-op.html',
      '48049780',
    )).resolves.toBe('Thread author');
  });
});
