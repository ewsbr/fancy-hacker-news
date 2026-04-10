export type ThemeName = 'light' | 'dark' | 'nord' | 'amoled';
export type ThemeScheme = 'light' | 'dark';

export type ThemeMetadata = {
  name: ThemeName;
  label: string;
  scheme: ThemeScheme;
  bg: string;
  surface: string;
  text: string;
  accent: string;
};

type ThemeConfig = {
  storageKey: string;
  bootstrapDatasetKey: string;
  themes: ThemeMetadata[];
};

const themeConfig = {
  storageKey: 'fancy-hn-theme',
  bootstrapDatasetKey: 'fancyHnTheme',
  themes: [
    {
      name: 'light',
      label: 'Light',
      scheme: 'light',
      bg: '#f6f6ef',
      surface: '#fffefa',
      text: '#111111',
      accent: '#ff6600',
    },
    {
      name: 'dark',
      label: 'Dark',
      scheme: 'dark',
      bg: '#1e1e1e',
      surface: '#252526',
      text: '#e3e3e3',
      accent: '#ff6600',
    },
    {
      name: 'nord',
      label: 'Nord',
      scheme: 'dark',
      bg: '#2e3440',
      surface: '#3b4252',
      text: '#eceff4',
      accent: '#88c0d0',
    },
    {
      name: 'amoled',
      label: 'AMOLED',
      scheme: 'dark',
      bg: '#000000',
      surface: '#000000',
      text: '#e0e0e0',
      accent: '#ff6600',
    },
  ],
} satisfies ThemeConfig;

const themeMetadata = themeConfig.themes.slice();
const themeMetadataByName = new Map<ThemeName, ThemeMetadata>(
  themeMetadata.map(theme => [theme.name, theme]),
);

export const STORAGE_KEY = themeConfig.storageKey;
export const BOOTSTRAP_THEME_DATASET_KEY = themeConfig.bootstrapDatasetKey;
export const THEMES = Object.freeze(themeMetadata) as readonly ThemeMetadata[];
export const THEME_NAMES = Object.freeze(
  themeMetadata.map(theme => theme.name),
) as readonly ThemeName[];

export function isThemeName(value: unknown): value is ThemeName {
  return typeof value === 'string' && themeMetadataByName.has(value as ThemeName);
}

export function getThemeMetadata(name: ThemeName): ThemeMetadata {
  return themeMetadataByName.get(name)!;
}

export function applyThemeToHost(host: HTMLElement, theme: ThemeName) {
  if (theme === 'light') {
    host.removeAttribute('data-theme');
    return;
  }

  host.setAttribute('data-theme', theme);
}

export function applyThemeToRootHost(theme: ThemeName) {
  const host = document.getElementById('fancy-hn-root');
  document.documentElement.dataset[BOOTSTRAP_THEME_DATASET_KEY] = theme;
  if (!host) {
    return;
  }

  applyThemeToHost(host, theme);
}
