export interface TrailingWordParts {
  lead: string;
  tail: string;
}

export function splitTrailingWord(text: string): TrailingWordParts {
  const match = text.match(/\S+\s*$/);

  if (!match) {
    return { lead: text, tail: '' };
  }

  const tail = match[0].trimEnd();
  return { lead: text.slice(0, match.index), tail };
}
