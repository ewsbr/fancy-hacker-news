import type { CommentPlaceholderKind } from './shared/body';
import { parseStoryContext, parseThreadCommentRow } from './shared/commentRow';
import { attrOf } from './shared/dom';
import { findMoreLink } from './shared/pagination';

export interface FlatComment {
  id: string;
  author: string;
  authorIsNew: boolean;
  score: number | null;
  age: string;
  ageLink: string;
  bodyHtml: string;
  placeholderKind: CommentPlaceholderKind | null;
  grayLevel: string | null;
  isDead: boolean;
  isFlagged: boolean;
  isDeleted: boolean;
  onStory: { title: string; link: string };
  voteUp: string | null;
  voteDown: string | null;
  voteUn: string | null;
}

export interface ParsedNewComments {
  introHtml: string | null;
  comments: FlatComment[];
  moreLink: string | null;
}

export function parseNewComments(doc: Document): ParsedNewComments {
  const bigbox = doc.querySelector('#bigbox > td');
  const introHtml = bigbox
    ? Array.from(bigbox.children)
      .filter(child => child.tagName !== 'TABLE')
      .map(child => child.outerHTML)
      .join('')
      .trim() || null
    : null;
  const rows = Array.from(doc.querySelectorAll<HTMLTableRowElement>('tr.athing'));
  const comments: FlatComment[] = [];

  for (const tr of rows) {
    const id = attrOf(tr, 'id');
    if (!id) continue;

    const row = parseThreadCommentRow(tr, { includeOnStory: true });
    const onStory = row.onStory ?? parseStoryContext(tr.querySelector('.comhead'));
    if (!onStory) continue;

    const comment: FlatComment = {
      id,
      author: row.author,
      authorIsNew: row.authorIsNew,
      score: row.score,
      age: row.age,
      ageLink: row.ageLink,
      bodyHtml: row.bodyHtml,
      placeholderKind: row.placeholderKind,
      grayLevel: row.grayLevel,
      isDead: row.isDead,
      isFlagged: row.isFlagged,
      isDeleted: row.isDeleted,
      onStory,
      voteUp: row.voteUp,
      voteDown: row.voteDown,
      voteUn: row.voteUn,
    };

    comments.push(comment);
  }

  return { introHtml, comments, moreLink: findMoreLink(doc) };
}
