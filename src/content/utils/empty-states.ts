import type { RouteDescriptor } from '@/router';

export function getStoryListEmptyMessage(route: RouteDescriptor): string {
  if (route.page === 'favorites') {
    return 'No favorite stories yet.';
  }

  if (route.page === 'upvoted') {
    return 'No upvoted stories yet.';
  }

  if (route.page === 'submitted') {
    return 'No submitted stories yet.';
  }

  if (route.page === 'hidden') {
    return 'No hidden stories.';
  }

  switch (route.params.type) {
    case 'jobs':
      return 'No job posts found.';
    case 'ask':
      return 'No Ask HN posts found.';
    case 'show':
      return 'No Show HN posts found.';
    case 'shownew':
      return 'No new Show HN posts found.';
    case 'launches':
      return 'No launches found.';
    default:
      return 'No stories found.';
  }
}

export function getCommentListEmptyMessage(route: RouteDescriptor): string {
  if (route.page === 'favorites') {
    return 'No favorite comments yet.';
  }

  if (route.page === 'upvoted') {
    return 'No upvoted comments yet.';
  }

  return 'No comments found.';
}

export function getThreadsEmptyMessage(username: string): string {
  return username ? `No comments found for ${username}.` : 'No comments found.';
}
