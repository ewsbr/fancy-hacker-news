export type ThemeName = 'light' | 'dark' | 'nord' | 'amoled';

export interface ThemeMetadata {
  name: ThemeName;
  label: string;
  scheme: 'light' | 'dark';
  bg: string;
  surface: string;
  text: string;
  accent: string;
}

export const BOOTSTRAP_THEME_DATASET_KEY = 'fancyHnTheme';

export const THEMES: readonly ThemeMetadata[] = [
  { name: 'light', label: 'Light', scheme: 'light', bg: '#f6f6ef', surface: '#fffefa', text: '#111111', accent: '#ff6600' },
  { name: 'dark', label: 'Dark', scheme: 'dark', bg: '#1e1e1e', surface: '#252526', text: '#e3e3e3', accent: '#ff6600' },
  { name: 'nord', label: 'Nord', scheme: 'dark', bg: '#2e3440', surface: '#3b4252', text: '#eceff4', accent: '#88c0d0' },
  { name: 'amoled', label: 'AMOLED', scheme: 'dark', bg: '#000000', surface: '#000000', text: '#e0e0e0', accent: '#ff6600' },
];

export function isThemeName(value: unknown): value is ThemeName {
  return THEMES.some(theme => theme.name === value);
}

export function getThemeMetadata(name: ThemeName): ThemeMetadata {
  return THEMES.find(theme => theme.name === name)!;
}

export function applyThemeToHost(host: HTMLElement, theme: ThemeName) {
  if (theme === 'light') {
    host.removeAttribute('data-theme');
  } else {
    host.setAttribute('data-theme', theme);
  }
}
