import { attrOf, hrefOf, textOf } from './shared/dom';

export type UserAboutSegment
  = | { type: 'text'; text: string }
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

export interface UserCollectionLinks {
  link: string;
  commentsLink: string;
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
  favorites: UserCollectionLinks;
  /** Only present on your own profile. */
  upvoted: UserCollectionLinks | null;
}

const URL_PATTERN = /\b(?:https?:\/\/[^\s<>"']+|www\.[^\s<>"']+)/gi;
const UNSAFE_TEXT_CONTAINERS = new Set(['SCRIPT', 'STYLE', 'TEMPLATE', 'NOSCRIPT']);
const TRAILING_URL_PUNCTUATION = /[),.;:!?]+$/;
// eslint-disable-next-line no-control-regex
const CONTROL_CHAR = /[\u0000-\u001F\u007F]/;

export function isUserCollectionHref(href: string | null, collection: 'favorites' | 'upvoted'): boolean {
  try {
    return href !== null && new URL(href, 'https://news.ycombinator.com').pathname === `/${collection}`;
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
  if (node.nodeType === node.TEXT_NODE) {
    return linkifyText(node.textContent ?? '');
  }

  if (node.nodeType !== node.ELEMENT_NODE) {
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
    if (child.nodeType === child.ELEMENT_NODE) {
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

function withCommentsParam(href: string): string {
  const url = new URL(href, 'https://news.ycombinator.com');
  url.searchParams.set('comments', 't');
  return /^https?:\/\//.test(href) ? url.toString() : `${url.pathname}${url.search}`.slice(href.startsWith('/') ? 0 : 1);
}

/** Collection tab links, preferring the profile's own links over derived ones. */
function findCollectionLinks(bigbox: Element | null, collection: 'favorites' | 'upvoted', fallback?: string): UserCollectionLinks | null {
  const hrefs = Array.from(bigbox?.querySelectorAll('a[href]') ?? [], link => link.getAttribute('href')!)
    .filter(href => isUserCollectionHref(href, collection));
  const link = hrefs.find(href => !href.includes('comments=t')) ?? fallback;
  return link ? { link, commentsLink: hrefs.find(href => href.includes('comments=t')) ?? withCommentsParam(link) } : null;
}

function findValueCell(bigbox: Element | null, label: string): Element | null {
  return Array.from(bigbox?.querySelectorAll('td') ?? []).find(td => textOf(td) === label)?.nextElementSibling ?? null;
}

export function parseUserPage(doc: Document): ParsedUserPage {
  const form = doc.querySelector<HTMLFormElement>('form.profileform[action="/xuser"]');
  // Scope all profile queries to #bigbox to avoid matching header nav elements.
  const bigbox = doc.getElementById('bigbox');
  const username = textOf(bigbox?.querySelector('a.hnuser'));
  const createdLinkEl = bigbox?.querySelector('a[href^="front?day="]');
  const formValue = (selector: string) => form?.querySelector<HTMLInputElement | HTMLSelectElement>(selector)?.value ?? null;

  return {
    username,
    created: textOf(createdLinkEl),
    createdLink: hrefOf(createdLinkEl) || '',
    karma: Number.parseInt(textOf(findValueCell(bigbox, 'karma:')) || '0', 10) || 0,
    // Own profiles expose an editable textarea; others show linkified HTML.
    about: form ? formValue('textarea[name="about"]') : null,
    aboutBlocks: form ? [] : parseUserAboutBlocks(findValueCell(bigbox, 'about:')),
    email: formValue('input[name="email"]'),
    isOwnProfile: form !== null,
    preferences: form && {
      showDead: formValue('select[name="showd"]'),
      noprocrast: formValue('select[name="nopro"]'),
      maxVisit: formValue('input[name="maxv"]'),
      minAway: formValue('input[name="mina"]'),
      delay: formValue('input[name="delay"]'),
    },
    editForm: form && {
      action: '/xuser',
      hmac: attrOf(form.querySelector('input[name="hmac"]'), 'value') || '',
      userId: attrOf(form.querySelector('input[name="id"]'), 'value') || '',
    },
    changePwLink: hrefOf(bigbox?.querySelector('a[href^="changepw"]')),
    submissionsLink: hrefOf(bigbox?.querySelector('a[href^="submitted?id="]')) || `submitted?id=${username}`,
    threadsLink: hrefOf(bigbox?.querySelector('a[href^="threads?id="]')) || `threads?id=${username}`,
    favorites: findCollectionLinks(bigbox, 'favorites', `favorites?id=${username}`)!,
    upvoted: findCollectionLinks(bigbox, 'upvoted'),
  };
}
