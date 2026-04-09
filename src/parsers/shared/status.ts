import { textOf } from './dom';

export interface ParsedStatusText {
  cleanText: string;
  isDead: boolean;
  isFlagged: boolean;
  isDeleted: boolean;
}

const STATUS_TOKEN_PATTERN = /\[(dead|flagged|deleted)\]/gi;

export function parseStatusText(text: string | null | undefined): ParsedStatusText {
  const sourceText = text?.trim() ?? '';
  const markers = Array.from(sourceText.matchAll(STATUS_TOKEN_PATTERN)).map(match => match[1].toLowerCase());

  return {
    cleanText: sourceText.replace(STATUS_TOKEN_PATTERN, '').replace(/\s+/g, ' ').trim(),
    isDead: markers.includes('dead'),
    isFlagged: markers.includes('flagged'),
    isDeleted: markers.includes('deleted'),
  };
}

export function parseStoryTitleStatus(titleLine: Element | null | undefined): ParsedStatusText {
  if (!titleLine) {
    return {
      cleanText: '',
      isDead: false,
      isFlagged: false,
      isDeleted: false,
    };
  }

  const clone = titleLine.cloneNode(true) as Element;
  for (const siteBit of clone.querySelectorAll('.sitebit')) {
    siteBit.remove();
  }

  return parseStatusText(textOf(clone));
}