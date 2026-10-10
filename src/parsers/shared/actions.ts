import { VOTE_LINK_SELECTOR } from '@/constants/hn-actions';
import { hrefOf, textOf } from './dom';

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
    | { kind: 'active'; href: string };

export interface ParseVoteStateOptions {
  itemId?: string | null;
  unvoteScopes?: Array<ParentNode | null | undefined>;
  isCollapsed?: boolean;
  preferredDirection?: VoteDirection;
}

function queryVoteLink(scope: ParentNode | null | undefined, how: 'up' | 'down'): HTMLAnchorElement | null {
  return scope?.querySelector<HTMLAnchorElement>(`${VOTE_LINK_SELECTOR}[href*="how=${how}"]`) ?? null;
}

function queryUnvoteLink(scope: ParentNode | null | undefined, itemId: string | null | undefined): HTMLAnchorElement | null {
  const links = Array.from(scope?.querySelectorAll<HTMLAnchorElement>(`${VOTE_LINK_SELECTOR}[href*="how=un"]`) ?? []);
  if (!itemId) {
    return links[0] ?? null;
  }

  return links.find(link => link.id === `un_${itemId}` || link.closest('[id]')?.id === `unv_${itemId}`) ?? null;
}

function isNoseeVoteElement(element: Element): boolean {
  return element.classList.contains('nosee') || element.closest('td.votelinks')?.classList.contains('nosee') === true;
}

function parseUnvoteDirection(link: Element, preferredDirection: VoteDirection | undefined): VoteDirection {
  const label = textOf(link).toLowerCase();
  return label === 'unvote' ? 'up' : label === 'undown' ? 'down' : preferredDirection ?? 'unknown';
}

function inferHiddenVoteDirection(
  upHref: string | null,
  downHref: string | null,
  preferredDirection: VoteDirection | undefined,
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
  const unvoteLink = (options.unvoteScopes ?? [voteScope])
    .map(scope => queryUnvoteLink(scope, options.itemId))
    .find(link => link !== null);
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
    return { kind: 'unavailable' };
  }

  // HN hides spent vote links with `nosee`; collapsed rows still expose them.
  const isSpent = [upLink, downLink].every(link => !link || isNoseeVoteElement(link));
  if (isSpent && !options.isCollapsed) {
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
  if (!href?.trim()) {
    return { kind: 'unavailable' };
  }

  return new URL(href, HN_ORIGIN).searchParams.get('un') === 't'
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
