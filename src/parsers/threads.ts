import type { CommentNode } from './item';
import { parseThreadCommentRow } from './shared/comment-row';
import { buildCommentTree } from './shared/comment-tree';
import { findMoreLink } from './shared/list-page';

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
  const username = doc.title.match(/^(.+?)'s comments/)?.[1] ?? '';
  const threads = buildCommentTree(doc.querySelectorAll('tr.athing.comtr'), tr => ({
    ...parseThreadCommentRow(tr, { includeOnStory: true }),
    descendantCount: 0,
    expandForHash: false,
    children: [],
  } satisfies ThreadEntry));

  return { username, threads, moreLink: findMoreLink(doc) };
}
