import {
  attrOf,
  hrefOf,
  isNewUser,
  parseAge,
  parseGrayLevel,
  parseScore,
  textOf,
} from './utils';
import { debugLog, debugMeasure } from '@/debug';

export interface ParsedItemPage {
  item: ItemDetail;
  comments: CommentNode[];
  replyForm: ReplyForm | null;
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
}

export interface ReplyForm {
  action: string;
  hmac: string;
  parentId: string;
  gotoUrl: string;
  submitLabel: string;
}

export interface CommentNode {
  id: string;
  author: string;
  authorIsNew: boolean;
  age: string;
  ageTimestamp: string;
  ageLink: string;
  bodyHtml: string;
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
  replyLink: string | null;
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
}

function countDescendants(node: CommentNode): number {
  let total = 0;

  for (const child of node.children) {
    total += 1 + countDescendants(child);
  }

  node.descendantCount = total;
  return total;
}

export function parseItemPage(doc: Document): ParsedItemPage {
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
    };

    const votelinks = athing?.querySelector('td.votelinks');
    parsedItem.voteUp = hrefOf(votelinks?.querySelector('a[href^="vote?"][href*="how=up"]'));
    parsedItem.voteDown = hrefOf(votelinks?.querySelector('a[href^="vote?"][href*="how=down"]'));
    parsedItem.voteUn = hrefOf(votelinks?.querySelector('a[href^="vote?"][href*="how=un"]'));

    if (isStory) {
      const titleline = athing?.querySelector('.titleline');
      const primaryLink = titleline?.querySelector('a');
      parsedItem.title = textOf(primaryLink);
      parsedItem.url = hrefOf(primaryLink);
      parsedItem.site = textOf(titleline?.querySelector('.sitestr'));

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
      if (toptext && toptext.innerHTML.trim()) {
        parsedItem.bodyHtml = toptext.innerHTML;
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

    const onStory = navs?.querySelector('.onstory a');
    parsedItem.storyTitle = textOf(onStory);
    parsedItem.storyLink = hrefOf(onStory);

    const commtext = athing?.querySelector('.commtext');
    if (commtext) {
      const replyDiv = commtext.querySelector('.reply');
      if (replyDiv) {
        replyDiv.remove();
      }
      parsedItem.bodyHtml = commtext.innerHTML;
    }

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

  // Parse comment tree
  const comtrs = debugMeasure('item:collect-comment-rows', () => {
    const commentTreeEl = doc.querySelector('table.comment-tree');
    return commentTreeEl ? Array.from(commentTreeEl.querySelectorAll('tr.athing.comtr')) : [];
  }, () => ({ rowCount: doc.querySelectorAll('table.comment-tree tr.athing.comtr').length }));

  const comments: CommentNode[] = [];
  const stack: { depth: number; children: CommentNode[] }[] = [{ depth: -1, children: comments }];
  let maxDepth = 0;
  let collapsedRows = 0;

  debugMeasure('item:build-comment-tree', () => {
    for (const tr of comtrs) {
      const id = attrOf(tr, 'id') || '';
      const indentSrc = attrOf(tr.querySelector('td.ind'), 'indent');
      const indent = indentSrc ? parseInt(indentSrc, 10) : 0;
      const isCollapsed = tr.classList.contains('coll');
      maxDepth = Math.max(maxDepth, indent);
      if (isCollapsed) {
        collapsedRows += 1;
      }

      const comhead = tr.querySelector('.comhead');
      const authorEl = comhead?.querySelector('a.hnuser');
      const author = textOf(authorEl);

      const isDead = comhead?.textContent?.includes('[dead]') || false;
      const isFlagged = comhead?.textContent?.includes('[flagged]') || false;

      const togg = comhead?.querySelector('a.togg');
      let collapsedCount = 0;
      if (togg) {
        const toggMatch = togg.textContent?.match(/(\d+)\s+more/);
        if (toggMatch) {
          collapsedCount = parseInt(toggMatch[1], 10);
        } else if (attrOf(togg, 'n')) {
          collapsedCount = parseInt(attrOf(togg, 'n') || '0', 10);
        }
      }

      const ageInfo = parseAge(comhead?.querySelector('.age'));

      const votelinks = tr.querySelector('td.votelinks');
      const voteUp = hrefOf(votelinks?.querySelector('a[href^="vote?"][href*="how=up"]'));
      const voteDown = hrefOf(votelinks?.querySelector('a[href^="vote?"][href*="how=down"]'));
      const voteUn = hrefOf(votelinks?.querySelector('a[href^="vote?"][href*="how=un"]'));

      const commtext = tr.querySelector('.commtext');
      const grayLevel = parseGrayLevel(commtext);

      const commentContainer = commtext?.parentElement;
      const replyLink = hrefOf(commentContainer?.querySelector('.reply a[href^="reply?"]'));

      const navs = comhead?.querySelector('.navs');
      const navLinksObj = {
        root: null as string | null,
        parent: null as string | null,
        prev: null as string | null,
        next: null as string | null,
        context: hrefOf(navs?.querySelector('a[href*="context"]')) || null,
      };

      const getHash = (el: Element | null | undefined) => {
        const href = hrefOf(el);
        if (!href) return null;
        const hashIndex = href.indexOf('#');
        return hashIndex !== -1 ? href.substring(hashIndex) : href;
      };

      if (navs) {
        const navAnchors = Array.from(navs.querySelectorAll('a'));
        navLinksObj.root = getHash(navAnchors.find(a => a.textContent?.includes('root')));
        navLinksObj.parent = getHash(navAnchors.find(a => a.textContent?.includes('parent')));
        navLinksObj.prev = getHash(navAnchors.find(a => a.textContent?.includes('prev')));
        navLinksObj.next = getHash(navAnchors.find(a => a.textContent?.includes('next')));
      }

      const node: CommentNode = {
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
        descendantCount: 0,
        expandForHash: false,
        navLinks: navLinksObj,
        children: [],
      };

      while (stack.length > 1 && stack[stack.length - 1].depth >= indent) {
        stack.pop();
      }

      stack[stack.length - 1].children.push(node);
      stack.push({ depth: indent, children: node.children });
    }
  }, () => ({ rowCount: comtrs.length, maxDepth, collapsedRows }));

  debugMeasure('item:annotate-descendants', () => {
    for (const comment of comments) {
      countDescendants(comment);
    }
  }, () => ({ rootCount: comments.length }));

  debugLog('item:summary', {
    itemType: item.type,
    commentCount: comtrs.length,
    rootCount: comments.length,
    maxDepth,
    collapsedRows,
  });

  return { item, comments, replyForm };
}
