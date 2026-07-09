import { attrOf, hrefOf, textOf } from './dom';

const HN_ORIGIN = 'https://news.ycombinator.com';

export type VoteDirection = 'up' | 'down' | 'unknown';

export type VoteState
  = | { kind: 'unavailable' }
    | { kind: 'available'; upHref: string | null; downHref: string | null }
    | {
      kind: 'active';
      direction: VoteDirection;
      unvoteHref: string;
      upHref: string | null;
      downHref: string | null;
    }
    | { kind: 'disabled-active'; direction: VoteDirection; upHref: string | null; downHref: string | null };

export type ToggleActionState
  = | { kind: 'unavailable' }
    | { kind: 'available'; href: string }
    | { kind: 'active'; href: string }
    | { kind: 'disabled-active' };

export interface ParseVoteStateOptions {
  itemId?: string | null;
  unvoteScopes?: Array<ParentNode | null | undefined>;
  isCollapsed?: boolean;
  preferredDirection?: VoteDirection;
}

const UNAVAILABLE_VOTE_STATE: VoteState = Object.freeze({ kind: 'unavailable' });
const UNAVAILABLE_TOGGLE_ACTION: ToggleActionState = Object.freeze({ kind: 'unavailable' });

function queryVoteLink(scope: ParentNode | null | undefined, how: 'up' | 'down'): HTMLAnchorElement | null {
  return scope?.querySelector<HTMLAnchorElement>(`a[href^="vote?"][href*="how=${how}"]`) ?? null;
}

function queryUnvoteLink(
  scope: ParentNode | null | undefined,
  itemId: string | null | undefined,
): HTMLAnchorElement | null {
  if (!scope) {
    return null;
  }

  if (itemId) {
    return Array.from(scope.querySelectorAll<HTMLAnchorElement>('a[href^="vote?"][href*="how=un"]'))
      .find((link) => {
        if (attrOf(link, 'id') === `un_${itemId}`) {
          return true;
        }

        return attrOf(link.closest('[id]'), 'id') === `unv_${itemId}`;
      }) ?? null;
  }

  return scope.querySelector<HTMLAnchorElement>('a[href^="vote?"][href*="how=un"]');
}

function isNoseeVoteElement(element: Element | null): boolean {
  if (!element) {
    return false;
  }

  return element.classList.contains('nosee')
    || element.closest('td.votelinks')?.classList.contains('nosee') === true;
}

function isUnParamHref(href: string): boolean {
  try {
    return new URL(href, HN_ORIGIN).searchParams.get('un') === 't';
  } catch {
    return href.includes('un=t');
  }
}

function parseUnvoteDirection(
  link: Element,
  preferredDirection: VoteDirection | null | undefined,
): VoteDirection {
  const label = textOf(link).toLowerCase();
  if (label === 'unvote') {
    return 'up';
  }

  if (label === 'undown') {
    return 'down';
  }

  return preferredDirection ?? 'unknown';
}

function inferHiddenVoteDirection(
  upHref: string | null,
  downHref: string | null,
  preferredDirection: VoteDirection | null | undefined,
): VoteDirection {
  if (upHref && !downHref) {
    return 'up';
  }

  if (downHref && !upHref) {
    return 'down';
  }

  return preferredDirection ?? 'unknown';
}

export function parseVoteState(
  voteScope: ParentNode | null | undefined,
  options: ParseVoteStateOptions = {},
): VoteState {
  const upLink = queryVoteLink(voteScope, 'up');
  const downLink = queryVoteLink(voteScope, 'down');
  const upHref = hrefOf(upLink);
  const downHref = hrefOf(downLink);
  const unvoteScopes = options.unvoteScopes ?? [voteScope];
  const unvoteLink = unvoteScopes
    .map(scope => queryUnvoteLink(scope, options.itemId))
    .find((link): link is HTMLAnchorElement => link !== null);
  const unvoteHref = hrefOf(unvoteLink);

  if (unvoteLink && unvoteHref) {
    return {
      kind: 'active',
      direction: parseUnvoteDirection(unvoteLink, options.preferredDirection),
      unvoteHref,
      upHref,
      downHref,
    };
  }

  if (!upHref && !downHref) {
    return UNAVAILABLE_VOTE_STATE;
  }

  const voteLinks = [upLink, downLink].filter((link): link is HTMLAnchorElement => link !== null);
  const hasHiddenVoteLink = voteLinks.some(link => isNoseeVoteElement(link));
  const hasVisibleVoteLink = voteLinks.some(link => !isNoseeVoteElement(link));

  if (hasVisibleVoteLink || options.isCollapsed) {
    return { kind: 'available', upHref, downHref };
  }

  if (hasHiddenVoteLink) {
    return {
      kind: 'disabled-active',
      direction: inferHiddenVoteDirection(upHref, downHref, options.preferredDirection),
      upHref,
      downHref,
    };
  }

  return { kind: 'available', upHref, downHref };
}

export function parseToggleActionState(href: string | null): ToggleActionState {
  if (href == null || href.trim() === '') {
    return UNAVAILABLE_TOGGLE_ACTION;
  }

  return isUnParamHref(href)
    ? { kind: 'active', href }
    : { kind: 'available', href };
}

export function getToggleActionHref(action: ToggleActionState): string | null {
  return action.kind === 'available' || action.kind === 'active' ? action.href : null;
}

export function getVoteActionHref(state: VoteState, direction: 'up' | 'down' | 'un'): string | null {
  if (direction === 'un') {
    return state.kind === 'active' ? state.unvoteHref : null;
  }

  if (state.kind !== 'available' && state.kind !== 'active') {
    return null;
  }

  return direction === 'up' ? state.upHref : state.downHref;
}
