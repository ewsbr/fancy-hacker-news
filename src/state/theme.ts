/**
 * useTheme composable — manages theme preference (light/dark/nord/amoled).
 *
 * Reads from chrome.storage.local, falls back to system preference,
 * and sets `data-theme` on the shadow host element.
 */
import { ref, watch, type Ref } from 'vue';

export type ThemeName = 'light' | 'dark' | 'nord' | 'amoled';

const THEMES: ThemeName[] = ['light', 'dark', 'nord', 'amoled'];
const STORAGE_KEY = 'hn-modern-theme';

let _shared: ReturnType<typeof createTheme> | null = null;

function detectSystem(): ThemeName {
  return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function applyToHost(theme: ThemeName) {
  const host = document.getElementById('hn-modern-root');
  if (!host) return;
  if (theme === 'light') {
    host.removeAttribute('data-theme');
  } else {
    host.setAttribute('data-theme', theme);
  }
}

function createTheme() {
  const theme = ref<ThemeName>(detectSystem());

  // Load persisted preference
  try {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      const stored = result[STORAGE_KEY] as unknown;
      if (typeof stored === 'string' && (THEMES as string[]).includes(stored)) {
        theme.value = stored as ThemeName;
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
