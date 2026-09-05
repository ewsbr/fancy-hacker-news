export interface HtmlTextBlock {
  lineLengths: number[];
  preformatted: boolean;
}

/**
 * Approximate normalized rich text without building another DOM tree.
 * Blocks carry paragraph spacing; explicit breaks only add lines. Source newlines
 * collapse to spaces outside preformatted blocks. This is not HTML sanitization.
 */
export function getHtmlTextBlocks(html: string): HtmlTextBlock[] {
  const blocks: HtmlTextBlock[] = [];
  let lines = [''];
  let preformatted = false;

  function finishBlock() {
    const normalized = preformatted ? lines : lines.map(line => line.trim().replace(/\s+/g, ' '));
    if (normalized.some(line => line.length > 0) || normalized.length > 1) {
      blocks.push({ lineLengths: normalized.map(line => line.length), preformatted });
    }
    lines = [''];
  }

  // Tokenize tags separately so inline markup cannot inflate the estimated width.
  for (const [token] of html.matchAll(/<[^>]*>|[^<]+|</g)) {
    if (/^<\/?(?:p|pre|blockquote|li|div)\b/i.test(token)) {
      finishBlock();
      if (/^<\/?pre\b/i.test(token)) preformatted = !/^<\//.test(token);
    } else if (/^<br\b/i.test(token)) {
      lines.push('');
    } else if (!token.startsWith('<')) {
      const text = token.replace(/&(?:#\d+|#x[\da-f]+|[a-z]+);/gi, 'x');
      const parts = preformatted ? text.replace(/\r\n?/g, '\n').split('\n') : [text.replace(/\s+/g, ' ')];
      lines[lines.length - 1] += parts[0];
      lines.push(...parts.slice(1));
    }
  }
  finishBlock();
  return blocks;
}
