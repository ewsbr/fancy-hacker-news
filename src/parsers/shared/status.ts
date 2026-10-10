import { textOf } from './dom';

export interface ParsedStatusText {
  cleanText: string;
  isDead: boolean;
  isFlagged: boolean;
  isDeleted: boolean;
}

const STATUS_TOKEN_PATTERN = /\[(dead|flagged|deleted)\]/gi;

/** Status markers in a story title line, ignoring the site domain. */
export function parseStoryTitleStatus(titleLine: Element | null | undefined): ParsedStatusText {
  const clone = titleLine?.cloneNode(true) as Element | undefined;
  clone?.querySelectorAll('.sitebit').forEach(siteBit => siteBit.remove());
  const text = textOf(clone);
  const markers = Array.from(text.matchAll(STATUS_TOKEN_PATTERN), match => match[1].toLowerCase());

  return {
    cleanText: text.replace(STATUS_TOKEN_PATTERN, '').replace(/\s+/g, ' ').trim(),
    isDead: markers.includes('dead'),
    isFlagged: markers.includes('flagged'),
    isDeleted: markers.includes('deleted'),
  };
}
