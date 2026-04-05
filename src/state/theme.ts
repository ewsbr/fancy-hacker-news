/**
 * useTheme composable — manages theme preference (light/dark/nord/amoled).
 *
 * Reads from chrome.storage.local, falls back to system preference,
 * and sets `data-theme` on the root host element.
 */
import { ref, watch, type Ref } from 'vue';

export type ThemeName = 'light' | 'dark' | 'nord' | 'amoled';

const THEMES: ThemeName[] = ['light', 'dark', 'nord', 'amoled'];
export const STORAGE_KEY = 'fancy-hn-theme';
const BOOTSTRAP_THEME_DATASET_KEY = 'fancyHnTheme';

let _shared: ReturnType<typeof createTheme> | null = null;

function isThemeName(value: unknown): value is ThemeName {
  return typeof value === 'string' && (THEMES as string[]).includes(value);
}

function detectSystem(): ThemeName {
  return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function getBootstrappedTheme(): ThemeName {
  const theme = document.documentElement.dataset[BOOTSTRAP_THEME_DATASET_KEY];
  return isThemeName(theme) ? theme : detectSystem();
}

function applyToHost(theme: ThemeName) {
  const host = document.getElementById('fancy-hn-root');
  document.documentElement.dataset[BOOTSTRAP_THEME_DATASET_KEY] = theme;
  if (!host) return;
  if (theme === 'light') {
    host.removeAttribute('data-theme');
  } else {
    host.setAttribute('data-theme', theme);
  }
}

function createTheme() {
  const theme = ref<ThemeName>(getBootstrappedTheme());

  // Load persisted preference
  try {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      const stored = result[STORAGE_KEY] as unknown;
      if (isThemeName(stored)) {
        theme.value = stored;
      }
    });
  } catch {
    // chrome.storage may not be available in dev
  }

  watch(theme, (val) => {
    applyToHost(val);
    try {
      chrome.storage.local.set({ [STORAGE_KEY]: val });
    } catch {
      // ignore
    }
  }, { immediate: true });

  function setTheme(name: ThemeName) {
    theme.value = name;
  }

  function cycleTheme() {
    const idx = THEMES.indexOf(theme.value);
    theme.value = THEMES[(idx + 1) % THEMES.length];
  }

  return { theme, setTheme, cycleTheme };
}

export function useTheme(): {
  theme: Ref<ThemeName>;
  setTheme: (name: ThemeName) => void;
  cycleTheme: () => void;
} {
  if (!_shared) _shared = createTheme();

  return _shared;
}
