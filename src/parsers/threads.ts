import { textOf, attrOf, hrefOf, isNewUser, parseAge, parseGrayLevel, findMoreLink } from './utils';
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

  const threads: ThreadEntry[] = [];
  const stack: { depth: number; children: ThreadEntry[] }[] = [
    { depth: -1, children: threads },
  ];

  for (const tr of comtrs) {
    const id = attrOf(tr, 'id') || '';
    const indentSrc = attrOf(tr.querySelector('td.ind'), 'indent');
    const indent = indentSrc ? parseInt(indentSrc, 10) : 0;
    const isCollapsed = tr.classList.contains('coll');

    const comhead = tr.querySelector<HTMLElement>('.comhead');
    const authorEl = comhead?.querySelector('a.hnuser');
    const author = textOf(authorEl);

    const isDead = comhead?.textContent?.includes('[dead]') ?? false;
    const isFlagged = comhead?.textContent?.includes('[flagged]') ?? false;

    const togg = comhead?.querySelector('a.togg');
    let collapsedCount = 0;
    if (togg) {
      const toggMatch = togg.textContent?.match(/(\d+)\s+more/);
      if (toggMatch) {
        collapsedCount = parseInt(toggMatch[1], 10);
      } else {
        collapsedCount = parseInt(attrOf(togg, 'n') || '0', 10);
      }
    }

    const ageInfo = parseAge(comhead?.querySelector('span.age'));

    const votelinks = tr.querySelector('td.votelinks');
    const voteUp = hrefOf(votelinks?.querySelector('a[href^="vote?"][href*="how=up"]'));
    const voteDown = hrefOf(votelinks?.querySelector('a[href^="vote?"][href*="how=down"]'));
    const voteUn = hrefOf(votelinks?.querySelector('a[href^="vote?"][href*="how=un"]'));

    const commtext = tr.querySelector('.commtext');
    const grayLevel = parseGrayLevel(commtext);

    const replyDiv = commtext?.parentElement?.querySelector('.reply');
    const replyLink = hrefOf(replyDiv?.querySelector('a'));

    const navs = comhead?.querySelector('.navs');
    const navAnchors = navs ? Array.from(navs.querySelectorAll('a')) : [];

    const navLinksObj = {
      root: hrefOf(navAnchors.find(a => a.textContent?.trim() === 'root')) ?? null,
      parent: hrefOf(navAnchors.find(a => a.textContent?.trim() === 'parent')) ?? null,
      prev: hrefOf(navAnchors.find(a => a.textContent?.trim() === 'prev')) ?? null,
      next: hrefOf(navAnchors.find(a => a.textContent?.trim() === 'next')) ?? null,
      context: hrefOf(navAnchors.find(a => a.textContent?.trim() === 'context')) ?? null,
    };

    // Story context (present on root comments, empty on child comments)
    const onstoryEl = comhead?.querySelector('span.onstory a[href^="item?id="]');
    const onStory = onstoryEl
      ? {
          title: attrOf(onstoryEl, 'title') || textOf(onstoryEl),
          link: hrefOf(onstoryEl) || '',
        }
      : null;

    const node: ThreadEntry = {
      id,
      author,
      authorIsNew: isNewUser(authorEl),
      age: ageInfo.text,
      ageTimestamp: ageInfo.timestamp,
      ageLink: ageInfo.link,
      bodyHtml: commtext?.innerHTML || '',
      grayLevel,
      indent,
      isCollapsed,
      isDead,
      isFlagged,
      collapsedCount,
      voteUp,
      voteDown,
      voteUn,
      flagUrl: null,
      replyLink,
      navLinks: navLinksObj,
      onStory,
      children: [],
    };

    while (stack.length > 1 && stack[stack.length - 1].depth >= indent) {
      stack.pop();
    }
    stack[stack.length - 1].children.push(node);
    stack.push({ depth: indent, children: node.children });
  }

  return { username, threads, moreLink: findMoreLink(doc) };
}
