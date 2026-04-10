import {
  textOf, hrefOf,
} from './shared/dom';
import { parseAge } from './shared/age';
import { findUnvoteHref, isNewUser } from './shared/comment';
import { findMoreLink } from './shared/pagination';
import { parseCommentCount, parseScore } from './shared/score';
import { parseStoryTitleStatus } from './shared/status';

export interface Story {
  id: string;
  rank: number | null;
  title: string;
  url: string | null;
  site: string | null;
  score: number | null;
  author: string | null;
  authorIsNew: boolean;
  age: string;
  ageTimestamp: string;
  ageLink: string;
  commentCount: number | null;
  commentLink: string | null;
  isJob: boolean;
  hideUrl: string | null;
  voteUp: string | null;
  voteUn: string | null;
  isDead: boolean;
  isFlagged: boolean;
  isDeleted: boolean;
}

export interface ParsedStoryList {
  introHtml: string | null;
  stories: Story[];
  moreLink: string | null;
  startRank: number;
}

export function parseStoryList(doc: Document): ParsedStoryList {
  const bigbox = doc.querySelector('#bigbox > td');
  const introHtml = bigbox
    ? Array.from(bigbox.children)
      .filter(child => child.tagName !== 'TABLE')
      .map(child => child.outerHTML)
      .join('')
      .trim() || null
    : null;
  const stories: Story[] = [];

  for (const row of doc.querySelectorAll<HTMLElement>('tr.athing.submission')) {
    const id = row.getAttribute('id');
    if (!id) continue;

    // Rank
    const rankText = textOf(row.querySelector('td.title > span.rank')).replace('.', '');
    const parsedRank = parseInt(rankText, 10);
    const rank = Number.isNaN(parsedRank) ? null : parsedRank;

    // Title + URL
    const titleLineEl = row.querySelector('span.titleline');
    const titleAnchor = titleLineEl?.querySelector('a') ?? null;
    const rawTitle = textOf(titleAnchor);
    const titleStatus = parseStoryTitleStatus(titleLineEl);
    const title = titleStatus.cleanText || rawTitle || '[deleted]';
    const url = hrefOf(titleAnchor);

    // Site domain
    const siteEl = titleLineEl?.querySelector('span.sitestr') ?? null;
    const site = textOf(siteEl) || null;

    // Vote link
    const voteEl = row.querySelector<HTMLAnchorElement>(`a#up_${id}`);
    const voteUp = hrefOf(voteEl);

    // Subtext row is the next <tr> after the athing row
    const subtextTd = row.nextElementSibling?.querySelector('td.subtext') ?? null;
    const sublineEl = subtextTd?.querySelector('span.subline') ?? null;
    const isJob = sublineEl === null;

    // Age — present even on job posts
    const ageSpan = (sublineEl ?? subtextTd)?.querySelector('span.age') ?? null;
    const { text: age, timestamp: ageTimestamp, link: ageLink } = parseAge(ageSpan);

    let score: number | null = null;
    let author: string | null = null;
    let authorIsNew = false;
    let hideUrl: string | null = null;
    let commentCount: number | null = null;
    let commentLink: string | null = null;
    let voteUn: string | null = null;

    if (sublineEl) {
      score = parseScore(textOf(sublineEl.querySelector(`span.score#score_${id}`)));

      const authorEl = sublineEl.querySelector('a.hnuser');
      author = textOf(authorEl) || null;
      authorIsNew = isNewUser(authorEl);

      hideUrl = hrefOf(sublineEl.querySelector('a.clicky.hider'));

      // Last a[href^="item?id="] in the subline is the comment/discuss link
      const commentAnchors = Array.from(
        sublineEl.querySelectorAll<HTMLAnchorElement>('a[href^="item?id="]'),
      );
      const commentAnchor = commentAnchors[commentAnchors.length - 1] ?? null;
      commentLink = hrefOf(commentAnchor);
      commentCount = parseCommentCount(textOf(commentAnchor));

      // Unvote link (JS-populated; almost always null on parse)
      voteUn = findUnvoteHref(sublineEl);
    }

    stories.push({
      id, rank, title, url, site,
      score, author, authorIsNew,
      age, ageTimestamp, ageLink,
      commentCount, commentLink,
      isJob, hideUrl,
      voteUp, voteUn,
      isDead: titleStatus.isDead,
      isFlagged: titleStatus.isFlagged,
      isDeleted: titleStatus.isDeleted,
    });
  }

  const moreLink = findMoreLink(doc);
  const startRank = stories[0]?.rank ?? 1;

  return { introHtml, stories, moreLink, startRank };
}
