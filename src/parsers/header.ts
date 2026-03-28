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
  user: HeaderUser | null;
  logoutUrl: string | null;
}

export function parseHeader(doc: Document): ParsedHeader {
  // First span.pagetop contains site name + nav links
  const navSpan = doc.querySelector('span.pagetop');
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

  // User info from second span.pagetop
  const meLink = doc.querySelector('a#me[href^="user?id="]');
  const karmaSpan = doc.querySelector('span#karma');
  const logoutLink = doc.querySelector('a#logout[href^="logout?auth="]');

  const user: HeaderUser | null = meLink
    ? {
        name: textOf(meLink),
        karma: karmaSpan ? Number(textOf(karmaSpan)) : 0,
      }
    : null;

  return {
    navLinks,
    user,
    logoutUrl: logoutLink ? hrefOf(logoutLink) : null,
  };
}
