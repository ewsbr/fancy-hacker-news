/**
 * Parse the HN leaders/leaderboard page (/leaders).
 */
import { parseInteger } from '@/utils/number';
import { textOf } from './shared/dom';
import { findUserLink } from './shared/user-link';

export interface ParsedLeadersPage {
  /** karma is null when HN hides it (top 10). */
  entries: { rank: number; username: string; karma: number | null }[];
}

export function parseLeadersPage(doc: Document): ParsedLeadersPage {
  const entries = Array.from(doc.querySelectorAll('tr.athing'), (row) => {
    const tds = row.querySelectorAll('td');
    const rank = parseInteger(textOf(tds[0]).replace('.', ''));
    const username = textOf(findUserLink(tds[1]));
    const karma = parseInteger(textOf(tds[2]).replace(/,/g, ''));
    return rank !== null && username ? { rank, username, karma } : null;
  }).filter(entry => entry !== null);

  return { entries };
}
