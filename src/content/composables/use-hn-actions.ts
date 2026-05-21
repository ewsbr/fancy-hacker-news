import { ref } from 'vue';
import { assert } from '@/utils/assert';

const HN_ORIGIN = 'https://news.ycombinator.com';

function getActionBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location?.href) {
    return window.location.href;
  }

  return HN_ORIGIN;
}

export type VoteDirection = 'up' | 'down' | 'un';

export interface VoteActionTarget {
  voteUp: string | null;
  voteDown?: string | null;
  voteUn: string | null;
}

export interface FlagActionTarget {
  flagUrl: string | null;
  isFlagged: boolean;
}

export interface FavoriteActionTarget {
  favoriteUrl: string | null;
}

export interface HideActionTarget {
  hideUrl: string | null;
}

function toAbsoluteUrl(href: string): URL {
  const trimmedHref = href.trim();
  assert(trimmedHref.length > 0, 'Expected action href to be non-empty');
  return new URL(trimmedHref, getActionBaseUrl());
}

function toRelativeHref(url: URL): string {
  const path = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname;
  return `${path}${url.search}${url.hash}`;
}

function buildVoteRequestHref(href: string): string {
  const url = toAbsoluteUrl(href);
  url.searchParams.set('js', 't');
  return url.toString();
}

function isOkResponse(response: Response): boolean {
  try {
    return new URL(response.url).pathname === '/ok';
  }
  catch {
    return false;
  }
}

function isManualRedirectResponse(response: Response): boolean {
  return response.type === 'opaqueredirect' || (response.status >= 300 && response.status < 400);
}

function isActionSuccessResponse(response: Response): boolean {
  return isManualRedirectResponse(response) || (response.ok && isOkResponse(response));
}

function buildUnvoteHref(href: string): string {
  const url = toAbsoluteUrl(href);
  url.searchParams.set('how', 'un');
  return toRelativeHref(url);
}

function toggleActionHref(href: string): string {
  const url = toAbsoluteUrl(href);

  if (url.searchParams.get('un') === 't') {
    url.searchParams.delete('un');
  }
  else {
    url.searchParams.set('un', 't');
  }

  return toRelativeHref(url);
}

async function sendActionRequest(href: string, appendJsParam = false): Promise<boolean> {
  if (!href.trim()) {
    return false;
  }

  try {
    const requestHref = appendJsParam ? buildVoteRequestHref(href) : toAbsoluteUrl(href).toString();
    const response = await fetch(requestHref, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      redirect: 'manual',
    });

    return isActionSuccessResponse(response);
  }
  catch (error) {
    console.error('Fancy HN action failed', error);
    return false;
  }
}

export function useHnActions() {
  const isBusy = ref(false);

  async function submitVote(
    target: VoteActionTarget,
    href: string,
    direction: VoteDirection,
  ): Promise<boolean> {
    if (isBusy.value) {
      return false;
    }

    isBusy.value = true;

    try {
      const succeeded = await sendActionRequest(href, true);
      if (!succeeded) {
        return false;
      }

      // This mirrors HN's client-side vote behavior: the request fires, then the
      // UI flips between vote and unvote locally without waiting for new markup.
      // The downvote path follows the same URL convention, but we do not have
      // fixture coverage for a karma-enabled account in this repo.
      target.voteUn = direction === 'un' ? null : buildUnvoteHref(href);
      return true;
    }
    finally {
      isBusy.value = false;
    }
  }

  async function submitFlag(target: FlagActionTarget): Promise<boolean> {
    if (isBusy.value || !target.flagUrl) {
      return false;
    }

    const href = target.flagUrl;
    isBusy.value = true;

    try {
      const succeeded = await sendActionRequest(href);
      if (!succeeded) {
        return false;
      }

      target.flagUrl = toggleActionHref(href);
      target.isFlagged = !target.isFlagged;
      return true;
    }
    finally {
      isBusy.value = false;
    }
  }

  async function submitFavorite(target: FavoriteActionTarget): Promise<boolean> {
    if (isBusy.value || !target.favoriteUrl) {
      return false;
    }

    const href = target.favoriteUrl;
    isBusy.value = true;

    try {
      const succeeded = await sendActionRequest(href);
      if (!succeeded) {
        return false;
      }

      target.favoriteUrl = toggleActionHref(href);
      return true;
    }
    finally {
      isBusy.value = false;
    }
  }

  async function submitHide(target: HideActionTarget): Promise<boolean> {
    if (isBusy.value || !target.hideUrl) {
      return false;
    }

    const href = target.hideUrl;
    isBusy.value = true;

    try {
      const succeeded = await sendActionRequest(href);
      if (!succeeded) {
        return false;
      }

      target.hideUrl = toggleActionHref(href);
      return true;
    }
    finally {
      isBusy.value = false;
    }
  }

  return {
    isBusy,
    submitVote,
    submitFlag,
    submitFavorite,
    submitHide,
  };
}
