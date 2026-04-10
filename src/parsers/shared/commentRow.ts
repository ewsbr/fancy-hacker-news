import { parseAge } from './age';
import type { CommentPlaceholderKind } from './body';
import { parseCommentBody } from './body';
import { attrOf, hrefOf, textOf } from './dom';
import { findUnvoteHref, isNewUser, parseGrayLevel } from './comment';
import { parseScore } from './score';

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

export interface ParsedCommentRowCommon {
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
  voteUp: string | null;
  voteDown: string | null;
  voteUn: string | null;
}

export interface ParsedThreadCommentRow extends ParsedCommentRowCommon {
  indent: number;
  isCollapsed: boolean;
  collapsedCount: number;
  flagUrl: string | null;
  editUrl: string | null;
  deleteUrl: string | null;
  replyLink: string | null;
  navLinks: ParsedCommentNavLinks;
  onStory: ParsedCommentStoryContext | null;
}

export interface ParseThreadCommentRowOptions {
  navLinkMode?: 'preserve' | 'hash';
  includeOnStory?: boolean;
}

const EMPTY_NAV_LINKS: ParsedCommentNavLinks = {
  root: null,
  parent: null,
  prev: null,
  next: null,
  context: null,
};

function normalizeNavHref(
  href: string | null,
  mode: ParseThreadCommentRowOptions['navLinkMode'],
): string | null {
  if (!href) {
    return null;
  }

  if (mode !== 'hash') {
    return href;
  }

  const hashIndex = href.indexOf('#');
  return hashIndex >= 0 ? href.slice(hashIndex) : href;
}

function findNavLink(navs: Element | null | undefined, label: string): string | null {
  const link = Array.from(navs?.querySelectorAll('a') ?? [])
    .find(anchor => textOf(anchor).toLowerCase() === label);
  return hrefOf(link);
}

function parseCollapsedCount(comhead: Element | null | undefined): number {
  const togg = comhead?.querySelector('a.togg');
  if (!togg) {
    return 0;
  }

  const toggMatch = togg.textContent?.match(/(\d+)\s+more/);
  if (toggMatch) {
    return parseInt(toggMatch[1], 10);
  }

  return parseInt(attrOf(togg, 'n') || '0', 10);
}

function parseCommentActions(
  tr: Element,
  commentEl: Element | null,
  navs: Element | null | undefined,
) {
  const replyDiv = commentEl?.querySelector('.reply');

  return {
    replyLink: hrefOf(replyDiv?.querySelector('a[href^="reply?"]')),
    flagUrl: hrefOf(replyDiv?.querySelector('a[href^="flag?"]'))
      || hrefOf(navs?.querySelector('a[href^="flag?"]')),
    editUrl: hrefOf(navs?.querySelector('a[href^="edit?"]'))
      || hrefOf(replyDiv?.querySelector('a[href^="edit?"]')),
    deleteUrl: hrefOf(navs?.querySelector('a[href^="delete-confirm?"]'))
      || hrefOf(replyDiv?.querySelector('a[href^="delete-confirm?"]')),
    voteUp: hrefOf(tr.querySelector('td.votelinks a[href^="vote?"][href*="how=up"]')),
    voteDown: hrefOf(tr.querySelector('td.votelinks a[href^="vote?"][href*="how=down"]')),
    voteUn: findUnvoteHref(tr),
  };
}

export function parseCommentIndent(tr: Element): number {
  const indentSrc = attrOf(tr.querySelector('td.ind'), 'indent');
  return indentSrc ? parseInt(indentSrc, 10) : 0;
}

export function parseStoryContext(scope: ParentNode | null | undefined): ParsedCommentStoryContext | null {
  const onStoryLink = scope?.querySelector?.('span.onstory a[href^="item?id="]') ?? null;
  if (!onStoryLink) {
    return null;
  }

  return {
    title: attrOf(onStoryLink, 'title') || textOf(onStoryLink),
    link: hrefOf(onStoryLink) || '',
  };
}

export function parseThreadCommentRow(
  tr: Element,
  options: ParseThreadCommentRowOptions = {},
): ParsedThreadCommentRow {
  const comhead = tr.querySelector('.comhead');
  const authorEl = comhead?.querySelector('a.hnuser');
  const commentEl = tr.querySelector('.comment');
  const commtext = commentEl?.querySelector('.commtext') ?? tr.querySelector('.commtext');
  const commentBody = parseCommentBody(commentEl ?? commtext);
  const actions = parseCommentActions(tr, commentEl, comhead?.querySelector('.navs'));
  const navs = comhead?.querySelector('.navs');
  const navLinkMode = options.navLinkMode ?? 'preserve';
  const ageInfo = parseAge(comhead?.querySelector('.age'));

  return {
    id: attrOf(tr, 'id') || '',
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
    isCollapsed: tr.classList.contains('coll'),
    isDead: comhead?.textContent?.includes('[dead]') ?? false,
    isFlagged: (comhead?.textContent?.includes('[flagged]') ?? false) || commentBody.placeholderKind === 'flagged',
    isDeleted: commentBody.placeholderKind === 'deleted',
    collapsedCount: parseCollapsedCount(comhead),
    voteUp: actions.voteUp,
    voteDown: actions.voteDown,
    voteUn: actions.voteUn,
    flagUrl: actions.flagUrl,
    editUrl: actions.editUrl,
    deleteUrl: actions.deleteUrl,
    replyLink: actions.replyLink,
    navLinks: navs ? {
      root: normalizeNavHref(findNavLink(navs, 'root'), navLinkMode),
      parent: normalizeNavHref(findNavLink(navs, 'parent'), navLinkMode),
      prev: normalizeNavHref(findNavLink(navs, 'prev'), navLinkMode),
      next: normalizeNavHref(findNavLink(navs, 'next'), navLinkMode),
      context: normalizeNavHref(findNavLink(navs, 'context'), navLinkMode),
    } : { ...EMPTY_NAV_LINKS },
    onStory: options.includeOnStory ? parseStoryContext(comhead) : null,
  };
}
