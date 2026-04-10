import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import {
  applyBootTheme,
  BOOTSTRAP_THEME_DATASET_KEY,
  THEME_BOOTSTRAP_PALETTES,
} from '@/content/theme-bootstrap';
import {
  applyThemeToHost,
  THEMES,
} from '@/state/theme-metadata';

describe('theme metadata', () => {
  it('derives bootstrap palettes from the canonical theme metadata', () => {
    expect(THEME_BOOTSTRAP_PALETTES).toEqual({
      light: { bg: '#f6f6ef', text: '#111111', scheme: 'light' },
      dark: { bg: '#1e1e1e', text: '#e3e3e3', scheme: 'dark' },
      nord: { bg: '#2e3440', text: '#eceff4', scheme: 'dark' },
      amoled: { bg: '#000000', text: '#e0e0e0', scheme: 'dark' },
    });

    expect(Object.keys(THEME_BOOTSTRAP_PALETTES)).toEqual(THEMES.map(theme => theme.name));
  });

  it('applies non-light themes to the extension host and clears light mode', () => {
    const dom = new JSDOM('<div id="fancy-hn-root" data-theme="dark"></div>');
    const host = dom.window.document.getElementById('fancy-hn-root');

    expect(host).toBeTruthy();

    applyThemeToHost(host!, 'nord');
    expect(host?.getAttribute('data-theme')).toBe('nord');

    applyThemeToHost(host!, 'light');
    expect(host?.hasAttribute('data-theme')).toBe(false);
  });

  it('applies bootstrap styles and host attributes from shared theme data', () => {
    const dom = new JSDOM('<!doctype html><html><body><div id="fancy-hn-root"></div></body></html>');
    const styleEl = dom.window.document.createElement('style');

    applyBootTheme(dom.window.document, styleEl, 'amoled');

    expect(dom.window.document.documentElement.dataset[BOOTSTRAP_THEME_DATASET_KEY]).toBe('amoled');
    expect(dom.window.document.getElementById('fancy-hn-root')?.getAttribute('data-theme')).toBe('amoled');
    expect(styleEl.textContent).toContain('background:#000000!important');
    expect(styleEl.textContent).toContain('color:#e0e0e0!important');
  });
});
