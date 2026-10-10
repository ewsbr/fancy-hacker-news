import { describe, expect, it } from 'vitest';
import { applyBootTheme } from '@/content/theme-bootstrap';
import {
  resolveStoredSettings,
  SETTINGS_SCHEMA_VERSION,
} from '@/state/settings';
import {
  applyThemeToHost,
  BOOTSTRAP_THEME_DATASET_KEY,
} from '@/state/theme-metadata';
import { parseHtmlDocument } from '../helpers/dom';

describe('theme metadata', () => {
  it('applies non-light themes to the extension host and clears light mode', () => {
    const doc = parseHtmlDocument('<div id="fancy-hn-root" data-theme="dark"></div>');
    const host = doc.getElementById('fancy-hn-root');

    expect(host).toBeTruthy();

    applyThemeToHost(host!, 'nord');
    expect(host?.getAttribute('data-theme')).toBe('nord');

    applyThemeToHost(host!, 'light');
    expect(host?.hasAttribute('data-theme')).toBe(false);
  });

  it('applies bootstrap styles from shared theme data', () => {
    const doc = parseHtmlDocument('<!doctype html><html><body><div id="fancy-hn-root"></div></body></html>');
    const styleEl = doc.createElement('style');

    applyBootTheme(doc, styleEl, 'amoled');

    expect(doc.documentElement.dataset[BOOTSTRAP_THEME_DATASET_KEY]).toBe('amoled');
    expect(styleEl.textContent).toContain('background:#000000!important');
    expect(styleEl.textContent).toContain('color:#e0e0e0!important');
  });

  it('applies bootstrap theme from canonical settings storage shape', () => {
    const doc = parseHtmlDocument('<!doctype html><html><body><div id="fancy-hn-root"></div></body></html>');
    const styleEl = doc.createElement('style');
    const resolved = resolveStoredSettings({
      schemaVersion: SETTINGS_SCHEMA_VERSION,
      theme: 'nord',
      contentWidth: 'default',
      features: {
        scrollToTop: true,
        longPressCommentCollapse: true,
        openLinksInNewTab: false,
      },
    }, 'amoled', 'light');

    applyBootTheme(doc, styleEl, resolved.theme);

    expect(doc.documentElement.dataset[BOOTSTRAP_THEME_DATASET_KEY]).toBe('nord');
    expect(styleEl.textContent).toContain('background:#2e3440!important');
  });
});
