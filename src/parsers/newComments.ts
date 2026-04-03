import { textOf, attrOf, hrefOf, isNewUser, normalizeQuotedHtml, parseAge, findMoreLink } from './utils';

export interface FlatComment {
  id: string;
  author: string;
  authorIsNew: boolean;
  age: string;
  ageLink: string;
  bodyHtml: string;
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

    const onstoryEl = comhead?.querySelector('span.onstory a[href^="item?id="]');
    // newcomments always have story context; skip malformed rows
    if (!onstoryEl) continue;

    const votelinks = tr.querySelector('td.votelinks');
    const voteUp = hrefOf(votelinks?.querySelector('a[href^="vote?"][href*="how=up"]'));
    const voteDown = hrefOf(votelinks?.querySelector('a[href^="vote?"][href*="how=down"]'));
    const voteUn = hrefOf(votelinks?.querySelector('a[href^="vote?"][href*="how=un"]'));

    const commtext = tr.querySelector('div.commtext');

    const comment: FlatComment = {
      id,
      author: textOf(authorEl),
      authorIsNew: isNewUser(authorEl),
      age: ageInfo.text,
      ageLink: ageInfo.link,
      bodyHtml: normalizeQuotedHtml(commtext?.innerHTML || ''),
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
