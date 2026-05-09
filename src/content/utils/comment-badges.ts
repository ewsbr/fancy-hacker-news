import type { InjectionKey } from 'vue';

export const COMMENT_THREAD_STORY_AUTHOR_KEY: InjectionKey<string | null> = Symbol('comment-thread-story-author');
export const COMMENT_THREAD_ROOT_AUTHOR_KEY: InjectionKey<string | null> = Symbol('comment-thread-root-author');

interface OriginalPosterContext {
  author: string;
  storyAuthor?: string | null;
  threadAuthor?: string | null;
  parentAuthor?: string | null;
}

export function getOriginalPosterTitle({
  author,
  storyAuthor = null,
  threadAuthor = null,
  parentAuthor = null,
}: OriginalPosterContext): string | null {
  if (!author) {
    return null;
  }

  const isStoryAuthor = Boolean(storyAuthor) && author === storyAuthor;
  const isThreadAuthor = Boolean(threadAuthor) && author === threadAuthor;
  const isParentAuthor = Boolean(parentAuthor) && author === parentAuthor;
  const labels: string[] = [];

  if (isStoryAuthor) {
    labels.push('Story author');
  }

  if (isThreadAuthor) {
    labels.push('Thread author');
  }

  if (isParentAuthor) {
    labels.push('Parent author');
  }

  return labels.length > 0 ? labels.join(' and ') : null;
}
