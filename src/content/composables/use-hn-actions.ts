import type { ToggleActionState, VoteState } from '@/parsers/shared/actions';
import { ref } from 'vue';
import { getToggleActionHref, getVoteActionHref } from '@/parsers/shared/actions';

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

async function sendActionRequest(url: URL): Promise<boolean> {
  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      redirect: 'manual',
    });

    // HN answers successful actions with a redirect, or with /ok for js=t votes.
    return response.type === 'opaqueredirect'
      || (response.status >= 300 && response.status < 400)
      || (response.ok && new URL(response.url).pathname === '/ok');
  } catch (error) {
    console.error('Fancy HN action failed', error);
    return false;
  }
}

export function useHnActions() {
  const isBusy = ref(false);

  async function runAction(href: string | null, onSuccess: () => void, configure?: (url: URL) => void) {
    if (isBusy.value || !href) {
      return false;
    }

    isBusy.value = true;
    try {
      const url = new URL(href, window.location.href);
      configure?.(url);
      const succeeded = await sendActionRequest(url);
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
