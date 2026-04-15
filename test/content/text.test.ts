import { describe, expect, it } from 'vitest';
import { splitTrailingWord } from '@/content/utils/text';

describe('text wrapping utilities', () => {
  it('splits the final word from leading title text', () => {
    expect(splitTrailingWord('Senior Product Engineer')).toEqual({
      lead: 'Senior Product ',
      tail: 'Engineer',
    });
  });

  it('keeps a single word as the trailing segment', () => {
    expect(splitTrailingWord('Engineer')).toEqual({
      lead: '',
      tail: 'Engineer',
    });
  });

  it('ignores trailing whitespace when finding the final word', () => {
    expect(splitTrailingWord('Senior  Engineer  ')).toEqual({
      lead: 'Senior  ',
      tail: 'Engineer',
    });
  });
});
