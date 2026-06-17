import { ref } from 'vue';
import type { ToggleActionState, VoteDirection, VoteState } from '@/parsers/shared/actions';
import { getToggleActionHref, getVoteActionHref } from '@/parsers/shared/actions';
import { assert } from '@/utils/assert';

const HN_ORIGIN = 'https://news.ycombinator.com';

function getActionBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location?.href) {
    return window.location.href;
  }

  return HN_ORIGIN;
}

export type VoteSubmitDirection = 'up' | 'down' | 'un';

export interface VoteActionTarget {
  voteState: VoteState;
}

export interface FlagActionTarget {
  flagAction: ToggleActionState;
  isFlagged: boolean;
}

export interface FavoriteActionTarget {
  favoriteAction: ToggleActionState;
}

export interface HideActionTarget {
  hideAction: ToggleActionState;
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

function toggleActionState(action: ToggleActionState): ToggleActionState {
  if (action.kind === 'available') {
    return { kind: 'active', href: toggleActionHref(action.href) };
  }

  if (action.kind === 'active') {
    return { kind: 'available', href: toggleActionHref(action.href) };
  }

  return action;
}

function makeActiveVoteState(
  currentState: Extract<VoteState, { kind: 'available' | 'active' }>,
  href: string,
  direction: Exclude<VoteDirection, 'unknown'>,
): VoteState {
  return {
    kind: 'active',
    direction,
    unvoteHref: buildUnvoteHref(href),
    upHref: currentState.upHref,
    downHref: currentState.downHref,
  };
}

function makeAvailableVoteState(currentState: Extract<VoteState, { kind: 'active' }>): VoteState {
  return {
    kind: 'available',
    upHref: currentState.upHref,
    downHref: currentState.downHref,
  };
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
    direction: VoteSubmitDirection,
  ): Promise<boolean> {
    if (isBusy.value) {
      return false;
    }

    const href = getVoteActionHref(target.voteState, direction);
    if (href == null) {
      return false;
    }

    isBusy.value = true;

    try {
      const succeeded = await sendActionRequest(href, true);
      if (!succeeded) {
        return false;
      }

      const currentState = target.voteState;
      if (direction === 'un') {
        if (currentState.kind === 'active') {
          target.voteState = makeAvailableVoteState(currentState);
        }
        return true;
      }

      if (currentState.kind === 'available' || currentState.kind === 'active') {
        target.voteState = makeActiveVoteState(currentState, href, direction);
      }
      return true;
    }
    finally {
      isBusy.value = false;
    }
  }

  async function submitFlag(target: FlagActionTarget): Promise<boolean> {
    const href = getToggleActionHref(target.flagAction);
    if (isBusy.value || href == null) {
      return false;
    }

    isBusy.value = true;

    try {
      const succeeded = await sendActionRequest(href);
      if (!succeeded) {
        return false;
      }

      target.flagAction = toggleActionState(target.flagAction);
      target.isFlagged = !target.isFlagged;
      return true;
    }
    finally {
      isBusy.value = false;
    }
  }

  async function submitFavorite(target: FavoriteActionTarget): Promise<boolean> {
    const href = getToggleActionHref(target.favoriteAction);
    if (isBusy.value || href == null) {
      return false;
    }

    isBusy.value = true;

    try {
      const succeeded = await sendActionRequest(href);
      if (!succeeded) {
        return false;
      }

      target.favoriteAction = toggleActionState(target.favoriteAction);
      return true;
    }
    finally {
      isBusy.value = false;
    }
  }

  async function submitHide(target: HideActionTarget): Promise<boolean> {
    const href = getToggleActionHref(target.hideAction);
    if (isBusy.value || href == null) {
      return false;
    }

    isBusy.value = true;

    try {
      const succeeded = await sendActionRequest(href);
      if (!succeeded) {
        return false;
      }

      target.hideAction = toggleActionState(target.hideAction);
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
