import { attrOf, hrefOf, textOf } from './dom';

export interface ParsedAge {
  text: string;
  timestamp: string;
  link: string;
}

export function parseAge(ageSpan: Element | null | undefined): ParsedAge {
  if (!ageSpan) {
    return { text: '', timestamp: '', link: '' };
  }

  const anchor = ageSpan.querySelector('a');
  return {
    text: textOf(anchor) || textOf(ageSpan),
    timestamp: attrOf(ageSpan, 'title') ?? '',
    link: hrefOf(anchor) ?? '',
  };
}