import { describe, expect, it } from 'vitest';
import { getLogoForegroundColor } from '@/content/utils/logo-contrast';

describe('getLogoForegroundColor', () => {
  it('keeps the Y white for saturated mid-tone top bar colors', () => {
    expect(getLogoForegroundColor('#ff6600')).toBe('#ffffff');
    expect(getLogoForegroundColor('#2faced')).toBe('#ffffff');
  });

  it('keeps the Y black on very light top bar colors', () => {
    expect(getLogoForegroundColor('#ffffff')).toBe('#000000');
    expect(getLogoForegroundColor('#f6f6ef')).toBe('#000000');
  });
});
