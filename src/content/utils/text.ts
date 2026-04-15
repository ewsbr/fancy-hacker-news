export interface TrailingWordParts {
  lead: string;
  tail: string;
}

export function splitTrailingWord(text: string): TrailingWordParts {
  const match = text.match(/^(.*?)(\S+)\s*$/);

  if (!match) {
    return { lead: text, tail: '' };
  }

  return { lead: match[1], tail: match[2] };
}
