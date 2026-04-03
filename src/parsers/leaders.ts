/**
 * Parse the HN leaders/leaderboard page (/leaders).
 */

export interface LeaderEntry {
  rank: number;
  username: string;
  karma: number | null; // null = hidden (top 10)
}

export interface ParsedLeadersPage {
  entries: LeaderEntry[];
}

export function parseLeadersPage(doc: Document): ParsedLeadersPage {
  const rows = doc.querySelectorAll('tr.athing');
  const entries: LeaderEntry[] = [];

  for (const row of rows) {
    const tds = row.querySelectorAll('td');
    if (tds.length < 2) continue;

    const rankText = tds[0].textContent?.trim().replace('.', '') ?? '';
    const rank = parseInt(rankText, 10);
    if (isNaN(rank)) continue;

    const userLink = tds[1].querySelector('a.hnuser');
    const username = userLink?.textContent?.trim() ?? '';
    if (!username) continue;

    const karmaText = tds[2]?.textContent?.trim() ?? '';
    const karma = karmaText === '' ? null : parseInt(karmaText.replace(/,/g, ''), 10);

    entries.push({ rank, username, karma: isNaN(karma as number) ? null : karma });
  }

  return { entries };
}
