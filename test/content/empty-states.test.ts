import type { PageName, RouteDescriptor } from '@/router';
import { describe, expect, it } from 'vitest';
import {
  getCommentListEmptyMessage,
  getStoryListEmptyMessage,
  getThreadsEmptyMessage,
} from '@/content/utils/empty-states';

function makeRoute(page: PageName, params: RouteDescriptor['params'] = {}): RouteDescriptor {
  return { page, params };
}

describe('empty state messaging', () => {
  it('uses route-specific story list messages for user lists', () => {
    expect(getStoryListEmptyMessage(makeRoute('favorites'))).toBe('No favorite stories yet.');
    expect(getStoryListEmptyMessage(makeRoute('upvoted'))).toBe('No upvoted stories yet.');
    expect(getStoryListEmptyMessage(makeRoute('submitted'))).toBe('No submitted stories yet.');
    expect(getStoryListEmptyMessage(makeRoute('hidden'))).toBe('No hidden stories.');
  });

  it('uses route-specific story list messages for special feeds', () => {
    expect(getStoryListEmptyMessage(makeRoute('stories', { type: 'jobs' }))).toBe('No job posts found.');
    expect(getStoryListEmptyMessage(makeRoute('stories', { type: 'show' }))).toBe('No Show HN posts found.');
    expect(getStoryListEmptyMessage(makeRoute('stories', { type: 'top' }))).toBe('No stories found.');
  });

  it('uses route-specific comment list messages', () => {
    expect(getCommentListEmptyMessage(makeRoute('favorites', { comments: 't' }))).toBe('No favorite comments yet.');
    expect(getCommentListEmptyMessage(makeRoute('upvoted', { comments: 't' }))).toBe('No upvoted comments yet.');
    expect(getCommentListEmptyMessage(makeRoute('newcomments'))).toBe('No comments found.');
  });

  it('includes the username for empty thread pages when available', () => {
    expect(getThreadsEmptyMessage('ewsbr')).toBe('No comments found for ewsbr.');
    expect(getThreadsEmptyMessage('')).toBe('No comments found.');
  });
});
