// @vitest-environment jsdom

import type { PropType } from 'vue';
import type { CommentNode } from '@/parsers/item';
import { describe, expect, it } from 'vitest';
import { defineComponent, h, provide, ref } from 'vue';
import { useCommentDisplayContext } from '@/content/composables/comment-node';
import {
  COMMENT_THREAD_ROOT_AUTHOR_KEY,
  COMMENT_THREAD_STORY_AUTHOR_KEY,
  getOriginalPosterTitle,
} from '@/content/utils/comment-badges';
import { parseItemPage } from '@/parsers/item';
import { loadFixtureDocument } from '../helpers/load-fixture';
import { mountComponent } from '../helpers/mount-component';

const DisplayContextProbe = defineComponent({
  name: 'DisplayContextProbe',
  props: {
    author: {
      type: String,
      required: true,
    },
    parentAuthor: {
      type: String as PropType<string | null>,
      default: null,
    },
    storyAuthor: {
      type: String as PropType<string | null>,
      default: null,
    },
    threadRootAuthor: {
      type: String as PropType<string | null>,
      default: null,
    },
  },
  setup(props) {
    const node = ref({
      id: 'comment-id',
      author: props.author,
      indent: 1,
    } as CommentNode);
    const context = useCommentDisplayContext({
      node,
      parentAuthor: ref(props.parentAuthor),
      threadAuthor: ref(null),
      showLocalThreadAuthor: ref(false),
      showOnStory: ref(false),
      rootVariant: ref('default'),
    });

    return () => h('div', context.originalPosterTitle.value ?? '');
  },
});

function getDisplayContextTitle(options: {
  author: string;
  parentAuthor?: string | null;
  storyAuthor?: string | null;
  threadRootAuthor?: string | null;
}): string | null {
  const wrapper = mountComponent(defineComponent({
    name: 'DisplayContextProvider',
    setup() {
      provide(COMMENT_THREAD_STORY_AUTHOR_KEY, options.storyAuthor ?? null);
      provide(COMMENT_THREAD_ROOT_AUTHOR_KEY, options.threadRootAuthor ?? null);

      return () => h(DisplayContextProbe, {
        author: options.author,
        parentAuthor: options.parentAuthor ?? null,
        storyAuthor: options.storyAuthor ?? null,
        threadRootAuthor: options.threadRootAuthor ?? null,
      });
    },
  }), {
    props: {
      author: options.author,
      parentAuthor: options.parentAuthor ?? null,
      storyAuthor: options.storyAuthor ?? null,
      threadRootAuthor: options.threadRootAuthor ?? null,
    },
  });
  const title = wrapper.text().trim();

  wrapper.unmount();
  return title || null;
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
