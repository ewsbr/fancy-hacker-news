import { textOf, attrOf, hrefOf } from './shared/dom';

export type UserAboutSegment =
  | { type: 'text'; text: string }
  | { type: 'link'; text: string; href: string };

export interface UserAboutBlock {
  segments: UserAboutSegment[];
}

export interface UserPreferences {
  showDead: string | null;
  noprocrast: string | null;
  maxVisit: string | null;
  minAway: string | null;
  delay: string | null;
}

export interface ParsedUserPage {
  username: string;
  created: string;
  createdLink: string;
  karma: number;
  about: string | null;
  aboutBlocks: UserAboutBlock[];
  email: string | null;
  isOwnProfile: boolean;
  preferences: UserPreferences | null;
  editForm: {
    action: string;
    hmac: string;
    userId: string;
  } | null;
  changePwLink: string | null;
  submissionsLink: string;
  threadsLink: string;
  upvotedLink: string | null;
  upvotedCommentsLink: string | null;
  favoritesLink: string;
  favoritesCommentsLink: string | null;
}

const TEXT_NODE = 3;
const ELEMENT_NODE = 1;
const URL_PATTERN = /\b(?:https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/gi;
const UNSAFE_TEXT_CONTAINERS = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'NOSCRIPT']);
const TRAILING_URL_PUNCTUATION = /[),.;:!?]+$/;
const CONTROL_CHAR = /[\u0000-\u001F\u007F]/;

function isUserCollectionHref(
  href: string | null | undefined,
  collection: 'favorites' | 'upvoted',
): boolean {
  if (!href) {
    return false;
  }

  if (href.startsWith(`${collection}?`) || href.startsWith(`/${collection}?`)) {
    return true;
  }

  try {
    return new URL(href, 'https://news.ycombinator.com').pathname === `/${collection}`;
  } catch {
    return false;
  }
}

function toSafeLinkHref(rawHref: string | null | undefined): string | null {
  const href = rawHref?.trim();
  if (!href || CONTROL_CHAR.test(href)) {
    return null;
  }

  const normalizedHref = href.startsWith('www.') ? `https://${href}` : href;

  try {
    const { protocol } = new URL(normalizedHref, 'https://news.ycombinator.com');
    return protocol === 'http:' || protocol === 'https:' ? normalizedHref : null;
  } catch {
    return null;
  }
}

function linkifyText(text: string): UserAboutSegment[] {
  const segments: UserAboutSegment[] = [];
  let offset = 0;
  URL_PATTERN.lastIndex = 0;

  for (const match of text.matchAll(URL_PATTERN)) {
    const matchText = match[0];
    const matchIndex = match.index ?? 0;

    if (matchIndex > offset) {
      segments.push({ type: 'text', text: text.slice(offset, matchIndex) });
    }

    const trailingPunctuation = matchText.match(TRAILING_URL_PUNCTUATION)?.[0] ?? '';
    const linkText = trailingPunctuation
      ? matchText.slice(0, -trailingPunctuation.length)
      : matchText;
    const href = toSafeLinkHref(linkText);

    if (href) {
      segments.push({ type: 'link', text: linkText, href });
    } else {
      segments.push({ type: 'text', text: linkText });
    }

    if (trailingPunctuation) {
      segments.push({ type: 'text', text: trailingPunctuation });
    }

    offset = matchIndex + matchText.length;
  }

  if (offset < text.length) {
    segments.push({ type: 'text', text: text.slice(offset) });
  }

  return segments;
}

function aboutSegmentsFromNode(node: Node): UserAboutSegment[] {
  if (node.nodeType === TEXT_NODE) {
    return linkifyText(node.textContent ?? '');
  }

  if (node.nodeType !== ELEMENT_NODE) {
    return [];
  }

  const element = node as Element;
  if (UNSAFE_TEXT_CONTAINERS.has(element.tagName)) {
    return [];
  }

  if (element.tagName === 'A') {
    const text = textOf(element);
    const href = toSafeLinkHref(attrOf(element, 'href'));

    return href && text ? [{ type: 'link', text, href }] : linkifyText(text);
  }

  return Array.from(element.childNodes).flatMap(aboutSegmentsFromNode);
}

function makeAboutBlock(segments: UserAboutSegment[]): UserAboutBlock | null {
  return segments.some(segment => segment.type === 'link' || segment.text.trim())
    ? { segments }
    : null;
}

function parseUserAboutBlocks(aboutCell: Element | null | undefined): UserAboutBlock[] {
  if (!aboutCell) {
    return [];
  }

  const blocks: UserAboutBlock[] = [];
  let currentSegments: UserAboutSegment[] = [];
  const flushCurrent = (): void => {
    const block = makeAboutBlock(currentSegments);
    if (block) {
      blocks.push(block);
    }
    currentSegments = [];
  };

  for (const child of Array.from(aboutCell.childNodes)) {
    if (child.nodeType === ELEMENT_NODE) {
      const element = child as Element;
      if (element.tagName === 'P' || element.tagName === 'BR') {
        flushCurrent();

        if (element.tagName === 'P') {
          const block = makeAboutBlock(aboutSegmentsFromNode(element));
          if (block) {
            blocks.push(block);
          }
        }

        continue;
      }
    }

    currentSegments.push(...aboutSegmentsFromNode(child));
  }

  flushCurrent();
  return blocks;
}

function stringifyUserAboutBlocks(blocks: UserAboutBlock[]): string | null {
  const about = blocks
    .map(block => block.segments.map(segment => segment.text).join('').trim())
    .filter(Boolean)
    .join('\n\n');

  return about || null;
}

function withCommentsParam(href: string | null | undefined): string | null {
  if (!href) {
    return null;
  }

  try {
    const url = new URL(href, 'https://news.ycombinator.com');
    url.searchParams.set('comments', 't');

    if (/^https?:\/\//.test(href)) {
      return url.toString();
    }

    return href.startsWith('/') ? `${url.pathname}${url.search}` : `${url.pathname}${url.search}`.replace(/^\//, '');
  } catch {
    return href.includes('?') ? `${href}&comments=t` : `${href}?comments=t`;
  }
}

export function parseUserPage(doc: Document): ParsedUserPage {
  const form = doc.querySelector<HTMLFormElement>('form.profileform[action="/xuser"]');
  const isOwnProfile = form !== null;

  // Scope all profile queries to #bigbox to avoid matching header nav elements
  const bigbox = doc.getElementById('bigbox');

  // Username
  const usernameEl = bigbox?.querySelector('a.hnuser');
  const username = textOf(usernameEl);

  // Karma — find <td>karma:</td> then read the adjacent td
  let karma = 0;
  bigbox?.querySelectorAll('td').forEach(td => {
    if (td.textContent?.trim() === 'karma:') {
      const next = td.nextElementSibling;
      if (next) karma = parseInt(next.textContent?.trim() || '0', 10) || 0;
    }
  });

  // Created
  const createdLinkEl = bigbox?.querySelector<HTMLAnchorElement>('a[href^="front?day="]') ?? null;
  const created = textOf(createdLinkEl);
  const createdLink = hrefOf(createdLinkEl) || '';

  // About — own profile exposes a textarea; other profile is plain HTML in td
  let about: string | null = null;
  let aboutBlocks: UserAboutBlock[] = [];
  if (isOwnProfile) {
    const textarea = form!.querySelector<HTMLTextAreaElement>('textarea[name="about"]');
    about = textarea?.value ?? null;
  } else {
    bigbox?.querySelectorAll('td').forEach(td => {
      if (td.textContent?.trim() === 'about:') {
        const next = td.nextElementSibling;
        aboutBlocks = parseUserAboutBlocks(next);
        about = stringifyUserAboutBlocks(aboutBlocks);
      }
    });
  }

  // Email (own profile only)
  const emailInput = form?.querySelector<HTMLInputElement>('input[name="email"]');
  const email = emailInput?.value ?? null;

  // Preferences (own profile only)
  let preferences: UserPreferences | null = null;
  if (isOwnProfile && form) {
    preferences = {
      showDead: form.querySelector<HTMLSelectElement>('select[name="showd"]')?.value ?? null,
      noprocrast: form.querySelector<HTMLSelectElement>('select[name="nopro"]')?.value ?? null,
      maxVisit: form.querySelector<HTMLInputElement>('input[name="maxv"]')?.value ?? null,
      minAway: form.querySelector<HTMLInputElement>('input[name="mina"]')?.value ?? null,
      delay: form.querySelector<HTMLInputElement>('input[name="delay"]')?.value ?? null,
    };
  }

  // Edit form credentials
  const editForm = isOwnProfile && form
    ? {
        action: attrOf(form, 'action') || '/xuser',
        hmac: attrOf(form.querySelector('input[name="hmac"]'), 'value') || '',
        userId: attrOf(form.querySelector('input[name="id"]'), 'value') || '',
      }
    : null;

  // Change password link
  const changePwLink = hrefOf(bigbox?.querySelector('a[href^="changepw"]'));

  // Submissions / threads links
  const submissionsLink =
    hrefOf(bigbox?.querySelector('a[href^="submitted?id="]')) || `submitted?id=${username}`;
  const threadsLink =
    hrefOf(bigbox?.querySelector('a[href^="threads?id="]')) || `threads?id=${username}`;

  // Upvoted links (submissions and comments variants; only present on own profile)
  const upvotedLinks = bigbox
    ? Array.from(bigbox.querySelectorAll<HTMLAnchorElement>('a[href]')).filter(el =>
        isUserCollectionHref(attrOf(el, 'href'), 'upvoted'),
      )
    : [];
  const upvotedLink =
    hrefOf(upvotedLinks.find(el => !(attrOf(el, 'href') || '').includes('comments=t'))) ?? null;
  const upvotedCommentsLink =
    hrefOf(upvotedLinks.find(el => (attrOf(el, 'href') || '').includes('comments=t'))) ?? null;

  // Favorites links
  const favLinks = bigbox
    ? Array.from(bigbox.querySelectorAll<HTMLAnchorElement>('a[href]')).filter(el =>
        isUserCollectionHref(attrOf(el, 'href'), 'favorites'),
      )
    : [];
  const favoritesLink =
    hrefOf(favLinks.find(el => !(attrOf(el, 'href') || '').includes('comments=t'))) ||
    `favorites?id=${username}`;
  const favoritesCommentsLink =
    hrefOf(favLinks.find(el => (attrOf(el, 'href') || '').includes('comments=t'))) ??
    withCommentsParam(favoritesLink);

  const normalizedUpvotedLink = upvotedLink ?? null;
  const normalizedUpvotedCommentsLink = upvotedCommentsLink ?? withCommentsParam(normalizedUpvotedLink);

  return {
    username,
    created,
    createdLink,
    karma,
    about,
    aboutBlocks,
    email,
    isOwnProfile,
    preferences,
    editForm,
    changePwLink,
    submissionsLink,
    threadsLink,
    upvotedLink: normalizedUpvotedLink,
    upvotedCommentsLink: normalizedUpvotedCommentsLink,
    favoritesLink,
    favoritesCommentsLink,
  };
}
