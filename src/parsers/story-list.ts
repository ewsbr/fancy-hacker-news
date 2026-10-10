import type { ToggleActionState, VoteDirection, VoteState } from './shared/actions';
import { parseInteger } from '@/utils/number';
import { parseToggleActionState, parseVoteState } from './shared/actions';
import { parseAge } from './shared/age';
import { isNewUser } from './shared/comment';
import {
  hrefOf,
  textOf,
} from './shared/dom';
import { findMoreLink, parseIntroHtml } from './shared/list-page';
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
  hideAction: ToggleActionState;
  voteState: VoteState;
  isDead: boolean;
  isFlagged: boolean;
  isDeleted: boolean;
}

export interface ParsedStoryList {
  introHtml: string | null;
  stories: Story[];
  moreLink: string | null;
}

export interface ParseStoryListOptions {
  preferredVoteDirection?: VoteDirection;
}

export function parseStoryList(doc: Document, options: ParseStoryListOptions = {}): ParsedStoryList {
  const stories = Array.from(doc.querySelectorAll('tr.athing.submission[id]'), (row): Story => {
    const id = row.id;
    const titleLineEl = row.querySelector('span.titleline');
    const titleAnchor = titleLineEl?.querySelector('a');
    const titleStatus = parseStoryTitleStatus(titleLineEl);
    // The subtext row follows the athing row; job posts have no subline.
    const subtextTd = row.nextElementSibling?.querySelector('td.subtext');
    const sublineEl = subtextTd?.querySelector('span.subline');
    const age = parseAge((sublineEl ?? subtextTd)?.querySelector('span.age'));
    const authorEl = sublineEl?.querySelector('a.hnuser');
    // The last item link in the subline is the comments/discuss link.
    const commentAnchor = Array.from(sublineEl?.querySelectorAll('a[href^="item?id="]') ?? []).pop();

    return {
      id,
      rank: parseInteger(textOf(row.querySelector('td.title > span.rank')).replace('.', '')),
      title: titleStatus.cleanText || textOf(titleAnchor) || '[deleted]',
      url: hrefOf(titleAnchor),
      site: textOf(titleLineEl?.querySelector('span.sitestr')) || null,
      score: sublineEl ? parseScore(textOf(sublineEl.querySelector(`span.score#score_${id}`))) : null,
      author: textOf(authorEl) || null,
      authorIsNew: isNewUser(authorEl),
      age: age.text,
      ageTimestamp: age.timestamp,
      ageLink: age.link,
      commentCount: sublineEl ? parseCommentCount(textOf(commentAnchor)) : null,
      commentLink: hrefOf(commentAnchor),
      isJob: !sublineEl,
      hideAction: parseToggleActionState(hrefOf(sublineEl?.querySelector('a.clicky.hider'))),
      voteState: parseVoteState(row, {
        itemId: id,
        unvoteScopes: sublineEl ? [sublineEl] : undefined,
        preferredDirection: options.preferredVoteDirection,
      }),
      isDead: titleStatus.isDead,
      isFlagged: titleStatus.isFlagged,
      isDeleted: titleStatus.isDeleted,
    };
  });

  return { introHtml: parseIntroHtml(doc), stories, moreLink: findMoreLink(doc) };
}
