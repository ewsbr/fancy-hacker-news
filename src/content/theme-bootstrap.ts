import type { ThemeName } from '@/state/theme-metadata';
import { BOOTSTRAP_THEME_DATASET_KEY, getThemeMetadata } from '@/state/theme-metadata';

export function applyBootTheme(doc: Document, styleEl: HTMLStyleElement, theme: ThemeName) {
  const { bg, text, scheme } = getThemeMetadata(theme);

  doc.documentElement.dataset[BOOTSTRAP_THEME_DATASET_KEY] = theme;
  styleEl.textContent = [
    'body>center{display:none!important}',
    `html,body{background:${bg}!important;color:${text}!important;color-scheme:${scheme}!important;}`,
    `#fancy-hn-root{background:${bg}!important;color:${text}!important;}`,
  ].join('');
}
