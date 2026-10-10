import type { ParsedCommentStoryContext, ParsedThreadCommentRow, ParseThreadCommentRowOptions } from './shared/comment-row';
import { parseThreadCommentRow } from './shared/comment-row';
import { findMoreLink, parseIntroHtml } from './shared/list-page';

export interface FlatComment extends ParsedThreadCommentRow {
  onStory: ParsedCommentStoryContext;
}

export interface ParsedNewComments {
  introHtml: string | null;
  comments: FlatComment[];
  moreLink: string | null;
}

export function parseNewComments(
  doc: Document,
  options: Pick<ParseThreadCommentRowOptions, 'preferredVoteDirection'> = {},
): ParsedNewComments {
  const comments = Array.from(doc.querySelectorAll('tr.athing[id]'), tr => parseThreadCommentRow(tr, { ...options, includeOnStory: true }))
    .filter((row): row is FlatComment => row.onStory !== null);

  return { introHtml: parseIntroHtml(doc), comments, moreLink: findMoreLink(doc) };
}
