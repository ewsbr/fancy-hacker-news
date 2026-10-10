import type { ToggleActionState, VoteState } from './shared/actions';
import type { CommentPlaceholderKind } from './shared/body';
import { FAVORITE_LINK_SELECTOR } from '@/constants/hn-actions';
import { assert } from '@/utils/assert';
import { parseToggleActionState, parseVoteState } from './shared/actions';
import { parseAge } from './shared/age';
import { extractRichTextHtml, parseCommentBody } from './shared/body';
import { isNewUser } from './shared/comment';
import { parseCommentIndent, parseThreadCommentRow } from './shared/comment-row';
import { buildCommentTree } from './shared/comment-tree';
import {
  attrOf,
  hrefOf,
  textOf,
} from './shared/dom';
import { parseScore } from './shared/score';
import { parseStoryTitleStatus } from './shared/status';

const EXTREME_THREAD_COMMENT_THRESHOLD = 1000;

export interface ParsedItemPage {
  item: ItemDetail;
  pollOptions: PollOption[];
  comments: CommentNode[];
  replyForm: ReplyForm | null;
}

export interface PollOption {
  id: string;
  text: string;
  score: number | null;
  voteState: VoteState;
}

export interface ItemDetail {
  id: string;
  type: 'story' | 'comment';
  title: string | null;
  url: string | null;
  site: string | null;
  score: number | null;
  author: string;
  authorIsNew: boolean;
  age: string;
  ageTimestamp: string;
  ageLink: string;
  bodyHtml: string | null;
  placeholderKind: CommentPlaceholderKind | null;
  storyTitle: string | null;
  storyLink: string | null;
  voteState: VoteState;
  hideAction: ToggleActionState;
  pastUrl: string | null;
  favoriteAction: ToggleActionState;
  flagAction: ToggleActionState;
  isDead: boolean;
  isFlagged: boolean;
  isDeleted: boolean;
}

export interface ReplyForm {
  action: string;
  hmac: string;
  parentId: string;
  gotoUrl: string;
  submitLabel: string;
}

export interface DeferredCommentThread {
  totalCommentCount: number;
  // Source rows stay attached until takeover succeeds. Loading replaces them
  // with a cached model so remounting does not need the original DOM again.
  state: { kind: 'pending'; rows: readonly Element[] } | { kind: 'loaded'; root: CommentNode };
}

export interface ParseItemPageOptions {
  extremeThreadCommentThreshold?: number;
  initialHashTargetId?: string | null;
}

export interface CommentNode {
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
  indent: number;
  isCollapsed: boolean;
  isDead: boolean;
  isFlagged: boolean;
  collapsedCount: number;
  voteState: VoteState;
  flagAction: ToggleActionState;
  editUrl: string | null;
  deleteUrl: string | null;
  replyLink: string | null;
  isDeleted: boolean;
  descendantCount: number;
  expandForHash: boolean;
  navLinks: {
    root: string | null;
    parent: string | null;
    prev: string | null;
    next: string | null;
    context: string | null;
  };
  children: CommentNode[];
  lazyThread?: DeferredCommentThread | null;
}

function findPollOptionsTable(fatitem: Element): Element | null {
  const toptextRow = fatitem.querySelector('.toptext')?.closest('tr');
  let currentRow = toptextRow?.nextElementSibling;

  while (currentRow) {
    if (currentRow.querySelector('form[action="comment"]')) {
      return null;
    }

    const table = currentRow.querySelector('table');
    if (table?.querySelector('tr.athing td.comment')) {
      return table;
    }

    currentRow = currentRow.nextElementSibling;
  }

  return null;
}

function parseCommentRow(tr: Element): CommentNode {
  return {
    ...parseThreadCommentRow(tr, { navLinkMode: 'hash' }),
    descendantCount: 0,
    expandForHash: false,
    children: [],
    lazyThread: null,
  };
}

export function parseCommentThreadRows(comtrs: Iterable<Element>): CommentNode[] {
  return buildCommentTree(comtrs, parseCommentRow);
}

/** Split rows into root threads; only the thread holding the hash target is parsed now. */
function buildDeferredCommentTree(comtrs: Element[], targetId: string | null | undefined): CommentNode[] {
  const slices: Element[][] = [];
  for (const tr of comtrs) {
    if (slices.length === 0 || parseCommentIndent(tr) === 0) {
      slices.push([]);
    }
    slices[slices.length - 1].push(tr);
  }

  return slices.map((rows) => {
    if (targetId && rows.some(tr => tr.id === targetId)) {
      return parseCommentThreadRows(rows)[0];
    }

    const shell = parseCommentRow(rows[0]);
    shell.descendantCount = rows.length - 1;
    shell.lazyThread = rows.length > 1 ? { totalCommentCount: rows.length, state: { kind: 'pending', rows } } : null;
    return shell;
  });
}

function parseRootItem(fatitem: Element): ItemDetail {
  const athing = fatitem.querySelector('tr.athing');
  const id = athing?.id ?? '';
  const voteState = parseVoteState(athing, { itemId: id, unvoteScopes: [fatitem] });

  if (athing?.classList.contains('submission')) {
    const titleline = athing.querySelector('.titleline');
    const primaryLink = titleline?.querySelector('a');
    const titleStatus = parseStoryTitleStatus(titleline);
    const subtext = fatitem.querySelectorAll('tr')[1]?.querySelector('.subtext');
    const authorEl = subtext?.querySelector('a.hnuser');
    const age = parseAge(subtext?.querySelector('.age'));

    return {
      id,
      type: 'story',
      title: titleStatus.cleanText || textOf(primaryLink) || (titleStatus.isDeleted ? '[deleted]' : null),
      url: hrefOf(primaryLink),
      site: textOf(titleline?.querySelector('.sitestr')),
      score: parseScore(textOf(subtext?.querySelector('.score'))),
      author: textOf(authorEl),
      authorIsNew: isNewUser(authorEl),
      age: age.text,
      ageTimestamp: age.timestamp,
      ageLink: age.link,
      bodyHtml: extractRichTextHtml(fatitem.querySelector('.toptext')) || null,
      placeholderKind: null,
      storyTitle: null,
      storyLink: null,
      voteState,
      hideAction: parseToggleActionState(hrefOf(subtext?.querySelector('a[href^="hide?"]'))),
      pastUrl: hrefOf(subtext?.querySelector('a.hnpast')),
      favoriteAction: parseToggleActionState(hrefOf(subtext?.querySelector(FAVORITE_LINK_SELECTOR))),
      flagAction: parseToggleActionState(hrefOf(subtext?.querySelector('a[href^="flag?"]'))),
      isDead: titleStatus.isDead,
      isFlagged: titleStatus.isFlagged,
      isDeleted: titleStatus.isDeleted,
    };
  }

  const comhead = athing?.querySelector('.comhead');
  const navs = comhead?.querySelector('.navs');
  const onStory = navs?.querySelector('.onstory a');
  const authorEl = comhead?.querySelector('a.hnuser');
  const age = parseAge(comhead?.querySelector('.age'));
  const body = parseCommentBody(athing?.querySelector('.comment') ?? athing?.querySelector('.commtext'));

  return {
    id,
    type: 'comment',
    title: null,
    url: null,
    site: null,
    score: null,
    author: textOf(authorEl),
    authorIsNew: isNewUser(authorEl),
    age: age.text,
    ageTimestamp: age.timestamp,
    ageLink: age.link,
    bodyHtml: body.html || null,
    placeholderKind: body.placeholderKind,
    storyTitle: textOf(onStory),
    storyLink: hrefOf(onStory),
    voteState,
    hideAction: { kind: 'unavailable' },
    pastUrl: null,
    favoriteAction: parseToggleActionState(hrefOf(navs?.querySelector(FAVORITE_LINK_SELECTOR))),
    flagAction: parseToggleActionState(
      hrefOf(navs?.querySelector('a[href^="flag?"]'))
      || hrefOf(athing?.querySelector('.reply a[href^="flag?"]')),
    ),
    isDead: comhead?.textContent?.includes('[dead]') ?? false,
    isFlagged: (comhead?.textContent?.includes('[flagged]') ?? false) || body.placeholderKind === 'flagged',
    isDeleted: body.placeholderKind === 'deleted',
  };
}

function parseReplyForm(fatitem: Element): ReplyForm | null {
  const formEl = fatitem.querySelector('form[action="comment"]');
  if (!formEl) {
    return null;
  }

  const inputValue = (selector: string) => attrOf(formEl.querySelector(selector), 'value') || '';
  return {
    action: 'comment',
    hmac: inputValue('input[name="hmac"]'),
    parentId: inputValue('input[name="parent"]'),
    gotoUrl: inputValue('input[name="goto"]'),
    submitLabel: inputValue('input[type="submit"]') || 'reply',
  };
}

// Poll options are tr.athing rows in a table after the toptext; each score is in the following row.
function parsePollOptions(fatitem: Element): PollOption[] {
  const rows = findPollOptionsTable(fatitem)?.querySelectorAll('tr.athing') ?? [];

  return Array.from(rows, row => [row, row.querySelector('td.comment')] as const)
    .filter(([, commentTd]) => commentTd)
    .map(([row, commentTd]) => ({
      id: row.id,
      text: textOf(commentTd),
      score: parseScore(textOf(row.nextElementSibling?.querySelector('.score'))),
      voteState: parseVoteState(row, { itemId: row.id, unvoteScopes: [row, row.nextElementSibling] }),
    }));
}

export function parseItemPage(doc: Document, options: ParseItemPageOptions = {}): ParsedItemPage {
  const fatitem = doc.querySelector('table.fatitem');
  assert(fatitem, 'Failed to find fatitem table');

  const comtrs = Array.from(doc.querySelector('table.comment-tree')?.querySelectorAll('tr.athing.comtr') ?? []);
  const comments = comtrs.length > (options.extremeThreadCommentThreshold ?? EXTREME_THREAD_COMMENT_THRESHOLD)
    ? buildDeferredCommentTree(comtrs, options.initialHashTargetId)
    : parseCommentThreadRows(comtrs);

  return {
    item: parseRootItem(fatitem),
    pollOptions: parsePollOptions(fatitem),
    comments,
    replyForm: parseReplyForm(fatitem),
  };
}
