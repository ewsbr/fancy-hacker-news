import {
  applyThemeToHost,
  BOOTSTRAP_THEME_DATASET_KEY,
  STORAGE_KEY,
  THEMES,
  type ThemeName,
} from '@/state/theme-metadata';

type ThemeBootstrapPalette = {
  bg: string;
  text: string;
  scheme: 'light' | 'dark';
};

export const THEME_BOOTSTRAP_PALETTES = Object.freeze(
  Object.fromEntries(
    THEMES.map(theme => [
      theme.name,
      {
        bg: theme.bg,
        text: theme.text,
        scheme: theme.scheme,
      } satisfies ThemeBootstrapPalette,
    ]),
  ) as Record<ThemeName, ThemeBootstrapPalette>,
);

export { BOOTSTRAP_THEME_DATASET_KEY, STORAGE_KEY };

export function detectSystemTheme(): ThemeName {
  return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function applyBootTheme(
  doc: Document,
  styleEl: HTMLStyleElement,
  theme: ThemeName,
) {
  const palette = THEME_BOOTSTRAP_PALETTES[theme];
  const host = doc.getElementById('fancy-hn-root');
  const HTMLElementCtor = doc.defaultView?.HTMLElement;

  doc.documentElement.dataset[BOOTSTRAP_THEME_DATASET_KEY] = theme;
  if (host && (!HTMLElementCtor || host instanceof HTMLElementCtor)) {
    applyThemeToHost(host, theme);
  }

  styleEl.textContent = [
    'body>center{display:none!important}',
    `html,body{background:${palette.bg}!important;color:${palette.text}!important;color-scheme:${palette.scheme}!important;}`,
    `#fancy-hn-root{background:${palette.bg}!important;color:${palette.text}!important;}`,
  ].join('');
}

export function getBootThemeStyleElement(doc: Document) {
  return Object.assign(doc.createElement('style'), {
    id: 'hn-anti-fouc',
  });
}
