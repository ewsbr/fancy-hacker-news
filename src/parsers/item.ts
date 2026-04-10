import {
  attrOf,
  hrefOf,
  textOf,
} from './shared/dom';
import { debugLog, debugMeasure } from '@/debug';
import { parseAge } from './shared/age';
import type { CommentPlaceholderKind } from './shared/body';
import { extractRichTextHtml, parseCommentBody } from './shared/body';
import { annotateDescendantCounts, buildIndentedCommentTree } from './shared/comment-tree';
import { parseCommentIndent, parseThreadCommentRow } from './shared/comment-row';
import { findUnvoteHref, isNewUser } from './shared/comment';
import { parseScore } from './shared/score';
import { parseStoryTitleStatus } from './shared/status';

const EXTREME_THREAD_COMMENT_THRESHOLD = 2000;

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
  voteUp: string | null;
  voteUn: string | null;
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
  parentLink: string | null;
  contextLink: string | null;
  storyTitle: string | null;
  storyLink: string | null;
  voteUp: string | null;
  voteDown: string | null;
  voteUn: string | null;
  hideUrl: string | null;
  pastUrl: string | null;
  favoriteUrl: string | null;
  flagUrl: string | null;
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
  html: string;
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
  voteUp: string | null;
  voteDown: string | null;
  voteUn: string | null;
  flagUrl: string | null;
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

interface CommentTreeBuildResult {
  comments: CommentNode[];
  maxDepth: number;
  collapsedRows: number;
}

interface CommentThreadSlice {
  rows: Element[];
  containsTarget: boolean;
}

function parseCommentRow(tr: Element): CommentNode {
  const row = parseThreadCommentRow(tr, { navLinkMode: 'hash' });

  return {
    ...row,
    descendantCount: 0,
    expandForHash: false,
    children: [],
    lazyThread: null,
  };
}

function buildCommentTree(comtrs: Element[]): CommentTreeBuildResult {
  return buildIndentedCommentTree(comtrs, parseCommentRow);
}

function annotateCommentDescendants(comments: CommentNode[]): CommentNode[] {
  return annotateDescendantCounts(comments);
}

function splitCommentRowsIntoRootSlices(
  comtrs: Element[],
  targetId: string | null | undefined,
): { slices: CommentThreadSlice[]; maxDepth: number; collapsedRows: number } {
  const slices: CommentThreadSlice[] = [];
  let currentSlice: CommentThreadSlice | null = null;
  let maxDepth = 0;
  let collapsedRows = 0;

  for (const tr of comtrs) {
    const indent = parseCommentIndent(tr);
    maxDepth = Math.max(maxDepth, indent);
    if (tr.classList.contains('coll')) {
      collapsedRows += 1;
    }

    if (!currentSlice || indent === 0) {
      currentSlice = {
        rows: [],
        containsTarget: false,
      };
      slices.push(currentSlice);
    }

    currentSlice.rows.push(tr);
    if (targetId && attrOf(tr, 'id') === targetId) {
      currentSlice.containsTarget = true;
    }
  }

  return { slices, maxDepth, collapsedRows };
}

function createDeferredCommentThread(rows: Element[]): DeferredCommentThread {
  return {
    totalCommentCount: rows.length,
    html: rows.map(row => row.outerHTML).join(''),
  };
}

function createRootShell(rows: Element[]): CommentNode {
  const shell = parseCommentRow(rows[0]);
  shell.children = [];
  shell.descendantCount = Math.max(0, rows.length - 1);
  shell.lazyThread = rows.length > 1 ? createDeferredCommentThread(rows) : null;
  return shell;
}

function buildExtremeCommentTree(
  comtrs: Element[],
  targetId: string | null | undefined,
): CommentTreeBuildResult {
  const { slices, maxDepth, collapsedRows } = splitCommentRowsIntoRootSlices(comtrs, targetId);
  const comments = slices.map(slice => {
    if (slice.containsTarget) {
      return parseCommentThreadRows(slice.rows)[0] ?? createRootShell(slice.rows);
    }

    return createRootShell(slice.rows);
  });

  return {
    comments,
    maxDepth,
    collapsedRows,
  };
}

export function parseCommentThreadRows(comtrs: Element[]): CommentNode[] {
  return annotateCommentDescendants(buildCommentTree(comtrs).comments);
}

export function parseCommentThreadHtml(html: string, doc: Document = document): CommentNode | null {
  const tbody = doc.createElement('tbody');
  tbody.innerHTML = html;
  const rows = Array.from(tbody.querySelectorAll('tr.athing.comtr'));
  const [root] = parseCommentThreadRows(rows);
  return root ?? null;
}

export function parseItemPage(doc: Document, options?: ParseItemPageOptions): ParsedItemPage {
  const fatitem = debugMeasure('item:find-fatitem', () => doc.querySelector('table.fatitem'));
  if (!fatitem) {
    throw new Error('Failed to find fatitem table');
  }

  const item = debugMeasure('item:parse-root-item', () => {
    const athing = fatitem.querySelector('tr.athing');
    const id = attrOf(athing, 'id') || '';
    const isStory = athing?.classList.contains('submission');

    const parsedItem: ItemDetail = {
      id,
      type: isStory ? 'story' : 'comment',
      title: null,
      url: null,
      site: null,
      score: null,
      author: '',
      authorIsNew: false,
      age: '',
      ageTimestamp: '',
      ageLink: '',
      bodyHtml: null,
      placeholderKind: null,
      parentLink: null,
      contextLink: null,
      storyTitle: null,
      storyLink: null,
      voteUp: null,
      voteDown: null,
      voteUn: null,
      hideUrl: null,
      pastUrl: null,
      favoriteUrl: null,
      flagUrl: null,
      isDead: false,
      isFlagged: false,
      isDeleted: false,
    };

    const votelinks = athing?.querySelector('td.votelinks');
    parsedItem.voteUp = hrefOf(votelinks?.querySelector('a[href^="vote?"][href*="how=up"]'));
    parsedItem.voteDown = hrefOf(votelinks?.querySelector('a[href^="vote?"][href*="how=down"]'));
    parsedItem.voteUn = findUnvoteHref(fatitem);

    if (isStory) {
      const titleline = athing?.querySelector('.titleline');
      const primaryLink = titleline?.querySelector('a');
      const titleStatus = parseStoryTitleStatus(titleline);
      parsedItem.title = titleStatus.cleanText || textOf(primaryLink) || (titleStatus.isDeleted ? '[deleted]' : null);
      parsedItem.url = hrefOf(primaryLink);
      parsedItem.site = textOf(titleline?.querySelector('.sitestr'));
      parsedItem.isDead = titleStatus.isDead;
      parsedItem.isFlagged = titleStatus.isFlagged;
      parsedItem.isDeleted = titleStatus.isDeleted;

      const subtext = fatitem.querySelectorAll('tr')[1]?.querySelector('.subtext');
      parsedItem.score = parseScore(textOf(subtext?.querySelector('.score')));
      const authorEl = subtext?.querySelector('a.hnuser');
      parsedItem.author = textOf(authorEl);
      parsedItem.authorIsNew = isNewUser(authorEl);

      const ageInfo = parseAge(subtext?.querySelector('.age'));
      parsedItem.age = ageInfo.text;
      parsedItem.ageTimestamp = ageInfo.timestamp;
      parsedItem.ageLink = ageInfo.link;

      parsedItem.hideUrl = hrefOf(subtext?.querySelector('a[href^="hide?"]'));
      parsedItem.pastUrl = hrefOf(subtext?.querySelector('a.hnpast'));
      parsedItem.favoriteUrl = hrefOf(subtext?.querySelector('a[href^="fave?"]'));
      parsedItem.flagUrl = hrefOf(subtext?.querySelector('a[href^="flag?"]'));

      const toptext = fatitem.querySelector('.toptext');
      const bodyHtml = extractRichTextHtml(toptext);
      if (bodyHtml) {
        parsedItem.bodyHtml = bodyHtml;
      }

      return parsedItem;
    }

    const comhead = athing?.querySelector('.comhead');
    const authorEl = comhead?.querySelector('a.hnuser');
    parsedItem.author = textOf(authorEl);
    parsedItem.authorIsNew = isNewUser(authorEl);

    const ageInfo = parseAge(comhead?.querySelector('.age'));
    parsedItem.age = ageInfo.text;
    parsedItem.ageTimestamp = ageInfo.timestamp;
    parsedItem.ageLink = ageInfo.link;

    const navs = comhead?.querySelector('.navs');
    parsedItem.parentLink = hrefOf(navs?.querySelector('a[href^="item?id="]'));
    parsedItem.contextLink = hrefOf(navs?.querySelector('a[href*="context"]'));
    parsedItem.favoriteUrl = hrefOf(navs?.querySelector('a[href^="fave?"]'));
    parsedItem.isDead = comhead?.textContent?.includes('[dead]') || false;
    parsedItem.isFlagged = comhead?.textContent?.includes('[flagged]') || false;

    const onStory = navs?.querySelector('.onstory a');
    parsedItem.storyTitle = textOf(onStory);
    parsedItem.storyLink = hrefOf(onStory);

    const commentEl = athing?.querySelector('.comment');
    const commtext = commentEl?.querySelector('.commtext') ?? athing?.querySelector('.commtext');
    const commentBody = parseCommentBody(commentEl ?? commtext);
    const bodyHtml = commentBody.html;
    if (bodyHtml) {
      parsedItem.bodyHtml = bodyHtml;
    }
    parsedItem.placeholderKind = commentBody.placeholderKind;
    parsedItem.isDeleted = commentBody.placeholderKind === 'deleted';
    parsedItem.isFlagged = parsedItem.isFlagged || commentBody.placeholderKind === 'flagged';

    return parsedItem;
  }, () => ({ itemType: fatitem.querySelector('tr.athing')?.classList.contains('submission') ? 'story' : 'comment' }));

  // Parse reply form
  const replyForm = debugMeasure('item:parse-reply-form', () => {
    const formEl = fatitem.querySelector('form[action="comment"]');
    if (formEl) {
      return {
        action: attrOf(formEl, 'action') || 'comment',
        hmac: attrOf(formEl.querySelector('input[name="hmac"]'), 'value') || '',
        parentId: attrOf(formEl.querySelector('input[name="parent"]'), 'value') || '',
        gotoUrl: attrOf(formEl.querySelector('input[name="goto"]'), 'value') || '',
        submitLabel: attrOf(formEl.querySelector('input[type="submit"]'), 'value') || 'reply',
      } satisfies ReplyForm;
    }

    fatitem.querySelector('div.reply a[href^="reply?"]');
    return null;
  });

  // Parse poll options
  // Poll options live inside fatitem as tr.athing rows that are NOT .submission and NOT .comtr
  const pollOptions: PollOption[] = debugMeasure('item:parse-poll', () => {
    const options: PollOption[] = [];
    const pollRows = fatitem.querySelectorAll('tr.athing:not(.submission):not(.comtr)');
    for (const row of pollRows) {
      const id = attrOf(row, 'id') || '';
      const commentTd = row.querySelector('td.comment');
      if (!commentTd) continue;
      const text = commentTd.textContent?.trim() || '';
      const voteUp = hrefOf(row.querySelector('td.votelinks a[href^="vote?"]'));
      const voteUn = findUnvoteHref(row);

      // Score is in the next sibling tr's td.default span.score
      const nextRow = row.nextElementSibling;
      const scoreText = textOf(nextRow?.querySelector('.score'));
      const score = parseScore(scoreText);

      options.push({ id, text, score, voteUp, voteUn });
    }
    return options;
  }, () => ({}));

  // Parse comment tree
  const comtrs = debugMeasure('item:collect-comment-rows', () => {
    const commentTreeEl = doc.querySelector('table.comment-tree');
    return commentTreeEl ? Array.from(commentTreeEl.querySelectorAll('tr.athing.comtr')) : [];
  }, () => ({ rowCount: doc.querySelectorAll('table.comment-tree tr.athing.comtr').length }));

  let comments: CommentNode[] = [];
  let maxDepth = 0;
  let collapsedRows = 0;
  const extremeThreadCommentThreshold = options?.extremeThreadCommentThreshold ?? EXTREME_THREAD_COMMENT_THRESHOLD;

  debugMeasure('item:build-comment-tree', () => {
    const result = comtrs.length > extremeThreadCommentThreshold
      ? buildExtremeCommentTree(comtrs, options?.initialHashTargetId)
      : buildCommentTree(comtrs);

    comments = result.comments;
    maxDepth = result.maxDepth;
    collapsedRows = result.collapsedRows;
  }, () => ({ rowCount: comtrs.length, maxDepth, collapsedRows }));

  debugMeasure('item:annotate-descendants', () => {
    annotateCommentDescendants(comments.filter(comment => !comment.lazyThread));
  }, () => ({ rootCount: comments.length }));

  debugLog('item:summary', {
    itemType: item.type,
    commentCount: comtrs.length,
    rootCount: comments.length,
    maxDepth,
    collapsedRows,
  });

  return { item, pollOptions, comments, replyForm };
}
