import { ref } from 'vue';

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

function toAbsoluteUrl(href: string): URL {
  return new URL(href, window.location.href);
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

function buildUnvoteHref(href: string): string {
  const url = toAbsoluteUrl(href);
  url.searchParams.set('how', 'un');
  return toRelativeHref(url);
}

// HN uses `un=t` for several reversible actions. We do not have fixture coverage
// for flag/unflag responses in this repo, so we mirror that convention here.
function toggleFlagHref(href: string): string {
  const url = toAbsoluteUrl(href);

  if (url.searchParams.get('un') === 't') {
    url.searchParams.delete('un');
  } else {
    url.searchParams.set('un', 't');
  }

  return toRelativeHref(url);
}

async function sendActionRequest(href: string, appendJsParam = false): Promise<boolean> {
  const requestHref = appendJsParam ? buildVoteRequestHref(href) : toAbsoluteUrl(href).toString();

  try {
    const response = await fetch(requestHref, {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      redirect: 'follow',
    });

    return response.ok;
  } catch (error) {
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
    } finally {
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

      target.flagUrl = toggleFlagHref(href);
      target.isFlagged = !target.isFlagged;
      return true;
    } finally {
      isBusy.value = false;
    }
  }

  return {
    isBusy,
    submitVote,
    submitFlag,
  };
}
