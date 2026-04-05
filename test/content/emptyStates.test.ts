import { describe, expect, it } from 'vitest';
import {
  getCommentListEmptyMessage,
  getStoryListEmptyMessage,
  getThreadsEmptyMessage,
} from '@/content/utils/emptyStates';
import type { RouteDescriptor } from '@/router';

function makeRoute(page: string, params: Record<string, string> = {}): RouteDescriptor {
  return { page, params };
}

describe('empty state messaging', () => {
  it('uses route-specific story list messages for user lists', () => {
    expect(getStoryListEmptyMessage(makeRoute('favorites', { id: 'ewsbr' }))).toBe('No favorite stories yet.');
    expect(getStoryListEmptyMessage(makeRoute('upvoted', { id: 'ewsbr' }))).toBe('No upvoted stories yet.');
    expect(getStoryListEmptyMessage(makeRoute('submitted', { id: 'ewsbr' }))).toBe('No submitted stories yet.');
    expect(getStoryListEmptyMessage(makeRoute('hidden', { id: 'ewsbr' }))).toBe('No hidden stories.');
  });

  it('uses route-specific story list messages for special feeds', () => {
    expect(getStoryListEmptyMessage(makeRoute('stories', { type: 'jobs' }))).toBe('No job posts found.');
    expect(getStoryListEmptyMessage(makeRoute('stories', { type: 'show' }))).toBe('No Show HN posts found.');
    expect(getStoryListEmptyMessage(makeRoute('stories'))).toBe('No stories found.');
  });

  it('uses route-specific comment list messages', () => {
    expect(getCommentListEmptyMessage(makeRoute('favorites', { id: 'ewsbr', comments: 't' }))).toBe('No favorite comments yet.');
    expect(getCommentListEmptyMessage(makeRoute('upvoted', { id: 'ewsbr', comments: 't' }))).toBe('No upvoted comments yet.');
    expect(getCommentListEmptyMessage(makeRoute('newcomments'))).toBe('No comments found.');
  });

  it('includes the username for empty thread pages when available', () => {
    expect(getThreadsEmptyMessage('ewsbr')).toBe('No comments found for ewsbr.');
    expect(getThreadsEmptyMessage('')).toBe('No comments found.');
  });
});
