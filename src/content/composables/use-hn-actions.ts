import type { ToggleActionState, VoteState } from '@/parsers/shared/actions';
import type { RequestHnActionResponse } from '@/utils/extension-messages';
import type { HnActionResult } from '@/utils/hn-action-request';
import { ref } from 'vue';
import { getToggleActionHref, getVoteActionHref } from '@/parsers/shared/actions';
import { makeRequestHnActionMessage } from '@/utils/extension-messages';
import { requestHnAction } from '@/utils/hn-action-request';

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

function toRelativeHref(url: URL): string {
  return `${url.pathname.slice(1)}${url.search}${url.hash}`;
}

/** Flip HN's `un=t` toggle parameter, which switches an action between doing and undoing. */
function toggleActionState(action: ToggleActionState): ToggleActionState {
  if (action.kind !== 'available' && action.kind !== 'active') {
    return action;
  }

  const url = new URL(action.href, window.location.href);
  if (url.searchParams.get('un') === 't') {
    url.searchParams.delete('un');
  } else {
    url.searchParams.set('un', 't');
  }

  return { kind: action.kind === 'available' ? 'active' : 'available', href: toRelativeHref(url) };
}

function requestHnActionInBackground(url: string): Promise<HnActionResult> {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(makeRequestHnActionMessage(url), (response?: RequestHnActionResponse) => {
      if (chrome.runtime.lastError || !response?.ok) {
        console.warn('Fancy HN background action failed', chrome.runtime.lastError?.message ?? response);
        resolve('rejected');
        return;
      }

      resolve(response.result);
    });
  });
}

let isPageSessionDropped = false;

async function sendActionRequest(requestUrl: URL, nativeUrl: URL): Promise<boolean> {
  if (!isPageSessionDropped) {
    try {
      if (await requestHnAction(requestUrl.toString()) === 'accepted') {
        return true;
      }
    } catch (error) {
      console.error('Fancy HN action failed', error);
      return false;
    }
  }

  // After Back, Firefox for Android restores HN from cache but sends the page's requests without the session cookie
  // until it reloads. HN then answers every action with its login page. The background script's requests still carry
  // the cookie. Observed in Firefox for Android in November 2026. The cookie loss also happens without the extension.
  isPageSessionDropped = true;
  if (await requestHnActionInBackground(requestUrl.toString()) === 'accepted') {
    return true;
  }

  window.location.assign(nativeUrl.toString());
  return false;
}

export function useHnActions() {
  const isBusy = ref(false);

  async function runAction(href: string | null, onSuccess: () => void, configure?: (url: URL) => void) {
    if (isBusy.value || !href) {
      return false;
    }

    isBusy.value = true;
    try {
      const nativeUrl = new URL(href, window.location.href);
      const requestUrl = new URL(nativeUrl);
      configure?.(requestUrl);
      const succeeded = await sendActionRequest(requestUrl, nativeUrl);
      if (succeeded) {
        onSuccess();
      }
      return succeeded;
    } finally {
      isBusy.value = false;
    }
  }

  function submitVote(target: VoteActionTarget, direction: VoteSubmitDirection) {
    const href = getVoteActionHref(target.voteState, direction);

    return runAction(href, () => {
      const { voteState } = target;
      if (voteState.kind !== 'available' && voteState.kind !== 'active') {
        return;
      }

      if (direction === 'un') {
        target.voteState = { kind: 'available', upHref: voteState.upHref, downHref: voteState.downHref };
        return;
      }

      const unvoteUrl = new URL(href!, window.location.href);
      unvoteUrl.searchParams.set('how', 'un');
      target.voteState = {
        kind: 'active',
        direction,
        unvoteHref: toRelativeHref(unvoteUrl),
        upHref: voteState.upHref,
        downHref: voteState.downHref,
      };
    }, url => url.searchParams.set('js', 't'));
  }

  function submitFlag(target: FlagActionTarget) {
    return runAction(getToggleActionHref(target.flagAction), () => {
      target.flagAction = toggleActionState(target.flagAction);
      target.isFlagged = !target.isFlagged;
    });
  }

  function submitFavorite(target: FavoriteActionTarget) {
    return runAction(getToggleActionHref(target.favoriteAction), () => {
      target.favoriteAction = toggleActionState(target.favoriteAction);
    });
  }

  function submitHide(target: HideActionTarget) {
    return runAction(getToggleActionHref(target.hideAction), () => {
      target.hideAction = toggleActionState(target.hideAction);
    });
  }

  return { isBusy, submitVote, submitFlag, submitFavorite, submitHide };
}
