/**
 * Parse the HN site header (nav links, user info, logout URL).
 */
import { textOf, hrefOf } from './utils';

export interface NavLink {
  label: string;
  href: string;
  active: boolean;
}

export interface HeaderUser {
  name: string;
  karma: number;
}

export interface ParsedHeader {
  navLinks: NavLink[];
  hasAuthControls: boolean;
  user: HeaderUser | null;
  loginUrl: string | null;
  logoutUrl: string | null;
}

export function parseHeader(doc: Document): ParsedHeader {
  const headerTable = doc.querySelector<HTMLTableElement>(
    '#hnmain > tbody > tr:first-child > td > table, #hnmain > tr:first-child > td > table',
  );
  const headerRow = headerTable?.rows[0] ?? null;
  const navCell = headerRow?.cells[1] ?? null;
  const authCell = headerRow && headerRow.cells.length >= 3 ? headerRow.cells[headerRow.cells.length - 1] : null;

  // First header content cell contains site name + nav links
  const navSpan = navCell?.querySelector('span.pagetop') ?? null;
  const navLinks: NavLink[] = [];

  if (navSpan) {
    const links = navSpan.querySelectorAll('a');
    const currentOp = doc.documentElement.getAttribute('op') ?? '';

    for (const a of links) {
      const label = textOf(a);
      const href = hrefOf(a) ?? '';
      // Active link matches the `op` attribute on <html>
      const active = href === currentOp || href.startsWith(currentOp + '?');
      navLinks.push({ label, href, active });
    }
  }

  // The top-right auth cell is optional on some HN pages.
  const authSpan = authCell?.querySelector('span.pagetop') ?? authCell;
  const meLink = authSpan?.querySelector('a#me[href^="user?id="]') ?? null;
  const karmaSpan = authSpan?.querySelector('span#karma') ?? null;
  const loginLink = authSpan?.querySelector('a[href^="login"]') ?? null;
  const logoutLink = authSpan?.querySelector('a#logout[href^="logout?auth="]') ?? null;

  const user: HeaderUser | null = meLink
    ? {
        name: textOf(meLink),
        karma: karmaSpan ? Number(textOf(karmaSpan)) : 0,
      }
    : null;

  return {
    navLinks,
    hasAuthControls: !!authCell && authSpan !== null && textOf(authSpan).length > 0,
    user,
    loginUrl: loginLink ? hrefOf(loginLink) : null,
    logoutUrl: logoutLink ? hrefOf(logoutLink) : null,
  };
}
