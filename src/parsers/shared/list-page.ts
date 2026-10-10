import { hrefOf } from './dom';

export function findMoreLink(doc: Document): string | null {
  return hrefOf(doc.querySelector('a.morelink[href]') ?? doc.querySelector('a[rel="next"][href]'));
}

/** Notices HN renders above list tables, such as /best ranges or collection tabs. */
export function parseIntroHtml(doc: Document): string | null {
  const bigbox = doc.querySelector('#bigbox > td');
  if (!bigbox) {
    return null;
  }

  return Array.from(bigbox.children)
    .filter(child => child.tagName !== 'TABLE')
    .map(child => child.outerHTML)
    .join('')
    .trim() || null;
}
