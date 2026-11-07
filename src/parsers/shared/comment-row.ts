import type { ToggleActionState, VoteDirection, VoteState } from './actions';
import type { CommentPlaceholderKind } from './body';
import { REPLY_LINK_SELECTOR } from '@/constants/hn-actions';
import { assert } from '@/utils/assert';
import { parseInteger } from '@/utils/number';
import { parseToggleActionState, parseVoteState } from './actions';
import { parseAge } from './age';
import { parseCommentBody } from './body';
import { parseGrayLevel } from './comment';
import { attrOf, hrefOf, textOf } from './dom';
import { parseScore } from './score';
import { findUserLink, isNewUser } from './user-link';

export interface ParsedCommentNavLinks {
  root: string | null;
  parent: string | null;
  prev: string | null;
  next: string | null;
  context: string | null;
}

export interface ParsedCommentStoryContext {
  title: string;
  link: string;
}

export interface ParsedThreadCommentRow {
  id: string;
  author: string;
  authorIsNew: boolean;
  score: number | null;
  age: string;
  ageTimestamp: string;
  ageLink: string;
  bodyHtml: string;
  placeholderKind: CommentPlaceholderKind | null;
  grayLevel: string | null;
  isDead: boolean;
  isFlagged: boolean;
  isDeleted: boolean;
  voteState: VoteState;
  indent: number;
  isCollapsed: boolean;
  collapsedCount: number;
  flagAction: ToggleActionState;
  editUrl: string | null;
  deleteUrl: string | null;
  replyLink: string | null;
  navLinks: ParsedCommentNavLinks;
  onStory: ParsedCommentStoryContext | null;
}

export interface ParseThreadCommentRowOptions {
  navLinkMode?: 'preserve' | 'hash';
  includeOnStory?: boolean;
  preferredVoteDirection?: VoteDirection;
}

function parseNavLinks(navs: Element | null | undefined, mode: ParseThreadCommentRowOptions['navLinkMode']): ParsedCommentNavLinks {
  const anchors = Array.from(navs?.querySelectorAll('a') ?? []);
  const find = (label: string) => {
    const href = hrefOf(anchors.find(anchor => textOf(anchor).toLowerCase() === label));
    // Item pages link within the current document, so keep only the fragment.
    return (mode === 'hash' && href?.includes('#') ? href.slice(href.indexOf('#')) : href) || null;
  };

  return { root: find('root'), parent: find('parent'), prev: find('prev'), next: find('next'), context: find('context') };
}

function parseCollapsedCount(comhead: Element | null | undefined): number {
  const togg = comhead?.querySelector('a.togg');
  if (!togg) {
    return 0;
  }

  return parseInteger(togg.textContent?.match(/(\d+)\s+more/)?.[1]) ?? parseInteger(attrOf(togg, 'n')) ?? 0;
}

function parseCommentActions(
  commentEl: Element | null,
  navs: Element | null | undefined,
) {
  const replyDiv = commentEl?.querySelector('.reply');

  return {
    replyLink: hrefOf(replyDiv?.querySelector(REPLY_LINK_SELECTOR)),
    flagAction: parseToggleActionState(
      hrefOf(replyDiv?.querySelector('a[href^="flag?"]'))
      || hrefOf(navs?.querySelector('a[href^="flag?"]')),
    ),
    editUrl: hrefOf(navs?.querySelector('a[href^="edit?"]'))
      || hrefOf(replyDiv?.querySelector('a[href^="edit?"]')),
    deleteUrl: hrefOf(navs?.querySelector('a[href^="delete-confirm?"]'))
      || hrefOf(replyDiv?.querySelector('a[href^="delete-confirm?"]')),
  };
}

export function parseCommentIndent(tr: Element): number {
  return parseInteger(attrOf(tr.querySelector('td.ind'), 'indent')) ?? 0;
}

function parseStoryContext(scope: ParentNode | null | undefined): ParsedCommentStoryContext | null {
  const onStoryLink = scope?.querySelector('span.onstory a[href^="item?id="]');
  return onStoryLink ? { title: attrOf(onStoryLink, 'title') || textOf(onStoryLink), link: hrefOf(onStoryLink)! } : null;
}

export function parseThreadCommentRow(
  tr: Element,
  options: ParseThreadCommentRowOptions = {},
): ParsedThreadCommentRow {
  const id = attrOf(tr, 'id');
  assert(id, 'Expected comment row to have an id');

  const comhead = tr.querySelector('.comhead');
  const authorEl = findUserLink(comhead);
  const commentEl = tr.querySelector('.comment');
  const commtext = commentEl?.querySelector('.commtext') ?? tr.querySelector('.commtext');
  const commentBody = parseCommentBody(commentEl ?? commtext);
  const navs = comhead?.querySelector('.navs');
  const actions = parseCommentActions(commentEl, navs);
  const ageInfo = parseAge(comhead?.querySelector('.age'));
  const isCollapsed = tr.classList.contains('coll');

  return {
    id,
    author: textOf(authorEl),
    authorIsNew: isNewUser(authorEl),
    score: parseScore(textOf(comhead?.querySelector('.score'))),
    age: ageInfo.text,
    ageTimestamp: ageInfo.timestamp,
    ageLink: ageInfo.link,
    bodyHtml: commentBody.html,
    placeholderKind: commentBody.placeholderKind,
    grayLevel: parseGrayLevel(commtext),
    indent: parseCommentIndent(tr),
    isCollapsed,
    isDead: comhead?.textContent?.includes('[dead]') ?? false,
    isFlagged: (comhead?.textContent?.includes('[flagged]') ?? false) || commentBody.placeholderKind === 'flagged',
    isDeleted: commentBody.placeholderKind === 'deleted',
    collapsedCount: parseCollapsedCount(comhead),
    voteState: parseVoteState(tr, {
      itemId: id,
      isCollapsed,
      preferredDirection: options.preferredVoteDirection,
    }),
    flagAction: actions.flagAction,
    editUrl: actions.editUrl,
    deleteUrl: actions.deleteUrl,
    replyLink: actions.replyLink,
    navLinks: parseNavLinks(navs, options.navLinkMode),
    onStory: options.includeOnStory ? parseStoryContext(comhead) : null,
  };
}
