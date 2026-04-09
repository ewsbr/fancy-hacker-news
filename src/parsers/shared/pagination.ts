import { hrefOf } from './dom';

export function findMoreLink(doc: Document): string | null {
  const more = doc.querySelector('a.morelink[href]') ?? doc.querySelector('a[rel="next"][href]');
  return more ? hrefOf(more) : null;
}