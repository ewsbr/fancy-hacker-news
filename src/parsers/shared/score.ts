export function parseScore(text: string | null | undefined): number | null {
  const match = text?.match(/(\d+)\s+points?/);
  return match ? Number(match[1]) : null;
}

export function parseCommentCount(text: string | null | undefined): number | null {
  if (!text) return null;
  const trimmedText = text.trim();
  if (trimmedText === 'discuss') return 0;
  const match = trimmedText.match(/(\d+)\s+comments?/);
  return match ? Number(match[1]) : null;
}