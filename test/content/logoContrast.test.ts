import { describe, expect, it } from 'vitest';
import { getLogoForegroundColor } from '@/content/shared/logoContrast';

describe('getLogoForegroundColor', () => {
  it('chooses black for bright top bar colors', () => {
    expect(getLogoForegroundColor('#ff6600')).toBe('#000000');
    expect(getLogoForegroundColor('#2faced')).toBe('#000000');
  });

  it('keeps the Y black on very light top bar colors', () => {
    expect(getLogoForegroundColor('#ffffff')).toBe('#000000');
    expect(getLogoForegroundColor('#f6f6ef')).toBe('#000000');
  });

  it('switches to white only for genuinely dark colors, including rgb syntax', () => {
    expect(getLogoForegroundColor('rgb(255, 255, 255)')).toBe('#000000');
    expect(getLogoForegroundColor('rgb(17, 17, 17)')).toBe('#ffffff');
  });
});
