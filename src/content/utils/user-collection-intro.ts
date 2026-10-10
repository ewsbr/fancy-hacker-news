import { isUserCollectionHref } from '@/parsers/user';

export interface UserCollectionLink {
  href: string;
  label: string;
  kind: 'stories' | 'comments';
}

export interface UserCollectionIntro {
  links: UserCollectionLink[];
  messages: string[];
}

const COLLECTION_LABELS: Record<string, string> = { submissions: 'Submissions', comments: 'Comments' };

/** Recognize the favorites/upvoted tab switcher HN renders above user collections. */
export function parseUserCollectionIntro(html: string | null, doc: Document): UserCollectionIntro | null {
  if (!html) {
    return null;
  }

  const template = doc.createElement('template');
  template.innerHTML = html.trim();

  const links = Array.from(template.content.querySelectorAll('a[href]'), (link) => {
    const href = link.getAttribute('href')!;
    const label = link.textContent!.trim();
    return {
      href,
      label: COLLECTION_LABELS[label.toLowerCase()] ?? label,
      kind: href.includes('comments=t') ? 'comments' as const : 'stories' as const,
    };
  }).filter(link => link.href).slice(0, 2);

  const isCollectionIntro = links.length === 2 && links.every(link =>
    isUserCollectionHref(link.href, 'favorites') || isUserCollectionHref(link.href, 'upvoted'));
  if (!isCollectionIntro) {
    return null;
  }

  return {
    links,
    messages: Array.from(template.content.querySelectorAll('p'), paragraph => paragraph.textContent!.trim()).filter(Boolean),
  };
}
