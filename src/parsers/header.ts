/**
 * Parse the HN site header (nav links, user info, logout URL).
 */
import { attrOf, textOf, hrefOf } from './shared/dom';

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
  topBarColor: string;
  hasCustomTopBarColor: boolean;
  hasMemorialBar: boolean;
  memorialBarColor: string | null;
}

export const DEFAULT_TOP_BAR_COLOR = '#ff6600';
const MEMORIAL_BAR_COLOR = '#000000';
const HEADER_TEST_TOP_BAR_COLOR_PARAM = 'fhTopBarColor';
const HEADER_TEST_MEMORIAL_BAR_PARAM = 'fhMemorialBar';

function normalizeColor(color: string | null | undefined): string | null {
  const value = color?.trim();

  if (!value) {
    return null;
  }

  if (/^#[0-9a-f]{3}$/i.test(value) || /^#[0-9a-f]{6}$/i.test(value)) {
    return value.toLowerCase();
  }

  if (/^[0-9a-f]{3}$/i.test(value) || /^[0-9a-f]{6}$/i.test(value)) {
    return `#${value.toLowerCase()}`;
  }

  return value;
}

function parseBooleanOverride(value: string | null): boolean | null {
  if (value === null) {
    return null;
  }

  const normalizedValue = value.trim().toLowerCase();

  if (['1', 'true', 'yes', 'on'].includes(normalizedValue)) {
    return true;
  }

  if (['0', 'false', 'no', 'off'].includes(normalizedValue)) {
    return false;
  }

  return null;
}

export function parseHeader(doc: Document): ParsedHeader {
  const hnMain = doc.querySelector<HTMLTableElement>('#hnmain');
  const headerSection = hnMain?.tBodies[0] ?? hnMain;
  const headerRows = headerSection
    ? Array.from(headerSection.children).filter(
        (child): child is HTMLTableRowElement => child.tagName === 'TR',
      )
    : [];
  const firstCell = headerRows[0]?.cells[0] ?? null;
  const secondCell = headerRows[1]?.cells[0] ?? null;
  const firstRowLooksLikeMemorialBar = normalizeColor(attrOf(firstCell, 'bgcolor')) === MEMORIAL_BAR_COLOR
    && firstCell?.querySelector('table') === null
    && secondCell?.querySelector('table') !== null;
  const headerCell = firstRowLooksLikeMemorialBar ? secondCell : firstCell;
  const headerTable = headerCell?.querySelector<HTMLTableElement>('table') ?? null;
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
  const searchParams = new URLSearchParams(doc.location?.search ?? '');
  const topBarColorOverride = normalizeColor(searchParams.get(HEADER_TEST_TOP_BAR_COLOR_PARAM));
  const memorialBarEnabledOverride = parseBooleanOverride(searchParams.get(HEADER_TEST_MEMORIAL_BAR_PARAM));

  const user: HeaderUser | null = meLink
    ? {
        name: textOf(meLink),
        karma: karmaSpan ? Number(textOf(karmaSpan)) : 0,
      }
    : null;

  const topBarColor = topBarColorOverride ?? normalizeColor(attrOf(headerCell, 'bgcolor')) ?? DEFAULT_TOP_BAR_COLOR;
  const hasCustomTopBarColor = topBarColorOverride !== null || topBarColor !== DEFAULT_TOP_BAR_COLOR;
  const hasMemorialBar = memorialBarEnabledOverride ?? firstRowLooksLikeMemorialBar;
  const memorialBarColor = hasMemorialBar ? MEMORIAL_BAR_COLOR : null;

  return {
    navLinks,
    hasAuthControls: !!authCell && authSpan !== null && textOf(authSpan).length > 0,
    user,
    loginUrl: loginLink ? hrefOf(loginLink) : null,
    logoutUrl: logoutLink ? hrefOf(logoutLink) : null,
    topBarColor,
    hasCustomTopBarColor,
    hasMemorialBar,
    memorialBarColor,
  };
}
