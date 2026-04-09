import { textOf, attrOf, hrefOf } from './shared/dom';

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
  if (isOwnProfile) {
    const textarea = form!.querySelector<HTMLTextAreaElement>('textarea[name="about"]');
    about = textarea?.value ?? null;
  } else {
    bigbox?.querySelectorAll('td').forEach(td => {
      if (td.textContent?.trim() === 'about:') {
        const next = td.nextElementSibling;
        if (next) about = next.innerHTML.trim() || null;
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
