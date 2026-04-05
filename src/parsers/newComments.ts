import type { CommentPlaceholderKind } from './utils';
import { textOf, attrOf, hrefOf, isNewUser, parseCommentBody, parseAge, parseGrayLevel, parseScore, findMoreLink, findUnvoteHref } from './utils';

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
  comments: FlatComment[];
  moreLink: string | null;
}

export function parseNewComments(doc: Document): ParsedNewComments {
  const rows = Array.from(doc.querySelectorAll<HTMLTableRowElement>('tr.athing'));
  const comments: FlatComment[] = [];

  for (const tr of rows) {
    const id = attrOf(tr, 'id');
    if (!id) continue;

    const comhead = tr.querySelector('span.comhead');
    const authorEl = comhead?.querySelector('a.hnuser');
    const ageInfo = parseAge(comhead?.querySelector('span.age'));
    const score = parseScore(textOf(comhead?.querySelector('span.score')));

    const onstoryEl = comhead?.querySelector('span.onstory a[href^="item?id="]');
    // newcomments always have story context; skip malformed rows
    if (!onstoryEl) continue;

    const votelinks = tr.querySelector('td.votelinks');
    const voteUp = hrefOf(votelinks?.querySelector('a[href^="vote?"][href*="how=up"]'));
    const voteDown = hrefOf(votelinks?.querySelector('a[href^="vote?"][href*="how=down"]'));
    const voteUn = findUnvoteHref(tr);

    const commentEl = tr.querySelector('div.comment');
    const commtext = commentEl?.querySelector('div.commtext') ?? tr.querySelector('div.commtext');
    const commentBody = parseCommentBody(commentEl ?? commtext);
    const grayLevel = parseGrayLevel(commtext);
    const isDead = comhead?.textContent?.includes('[dead]') ?? false;
    const isFlagged = comhead?.textContent?.includes('[flagged]') ?? false;

    const comment: FlatComment = {
      id,
      author: textOf(authorEl),
      authorIsNew: isNewUser(authorEl),
      score,
      age: ageInfo.text,
      ageLink: ageInfo.link,
      bodyHtml: commentBody.html,
      placeholderKind: commentBody.placeholderKind,
      grayLevel,
      isDead,
      isFlagged: isFlagged || commentBody.placeholderKind === 'flagged',
      isDeleted: commentBody.placeholderKind === 'deleted',
      onStory: {
        title: attrOf(onstoryEl, 'title') || textOf(onstoryEl),
        link: hrefOf(onstoryEl) || '',
      },
      voteUp,
      voteDown,
      voteUn,
    };

    comments.push(comment);
  }

  return { comments, moreLink: findMoreLink(doc) };
}
