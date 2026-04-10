import { buildIndentedCommentTree, annotateDescendantCounts } from './shared/commentTree';
import { parseThreadCommentRow } from './shared/commentRow';
import { findMoreLink } from './shared/pagination';
import type { CommentNode } from './item';

export interface ThreadEntry extends Omit<CommentNode, 'children'> {
  onStory: { title: string; link: string } | null;
  children: ThreadEntry[];
}

export interface ParsedThreadsPage {
  username: string;
  threads: ThreadEntry[];
  moreLink: string | null;
}

export function parseThreadsPage(doc: Document): ParsedThreadsPage {
  // Extract from title: "j0rg3's comments | Hacker News"
  const titleMatch = doc.title?.match(/^(.+?)'s comments/);
  const username = titleMatch ? titleMatch[1] : '';

  const comtrs = Array.from(doc.querySelectorAll<HTMLTableRowElement>('tr.athing.comtr'));

  const { comments: threads } = buildIndentedCommentTree(comtrs, tr => {
    const row = parseThreadCommentRow(tr, {
      navLinkMode: 'preserve',
      includeOnStory: true,
    });

    return {
      ...row,
      descendantCount: 0,
      expandForHash: false,
      onStory: row.onStory,
      children: [],
    } satisfies ThreadEntry;
  });

  annotateDescendantCounts(threads);

  return { username, threads, moreLink: findMoreLink(doc) };
}
