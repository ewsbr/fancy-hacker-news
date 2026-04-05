export interface UserCollectionLink {
  href: string;
  label: string;
  kind: 'stories' | 'comments';
}

export interface UserCollectionIntro {
  links: UserCollectionLink[];
  messages: string[];
}

function normalizeCollectionLabel(text: string): string {
  const normalized = text.trim().toLowerCase();

  if (normalized === 'submissions') {
    return 'Submissions';
  }

  if (normalized === 'comments') {
    return 'Comments';
  }

  return text.trim();
}

function getCollectionKind(href: string): UserCollectionLink['kind'] {
  return href.includes('comments=t') ? 'comments' : 'stories';
}

export function parseUserCollectionIntro(
  html: string | null | undefined,
  doc: Document,
): UserCollectionIntro | null {
  if (!html?.trim()) {
    return null;
  }

  const template = doc.createElement('template');
  template.innerHTML = html.trim();

  const links = Array.from(template.content.querySelectorAll<HTMLAnchorElement>('a[href]'))
    .map(link => ({
      href: link.getAttribute('href') || '',
      label: normalizeCollectionLabel(link.textContent || ''),
      kind: getCollectionKind(link.getAttribute('href') || ''),
    }))
    .filter(link => link.href);

  if (links.length < 2) {
    return null;
  }

  const firstTwoLinks = links.slice(0, 2);
  const isCollectionIntro = firstTwoLinks.every(link =>
    link.href.startsWith('favorites?') || link.href.startsWith('upvoted?'),
  );

  if (!isCollectionIntro) {
    return null;
  }

  const messages = Array.from(template.content.querySelectorAll('p'))
    .map(paragraph => paragraph.textContent?.trim() || '')
    .filter(Boolean);

  return {
    links: firstTwoLinks,
    messages,
  };
}
