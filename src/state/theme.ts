import type { ComputedRef } from 'vue';
import type { ThemeName } from './theme-metadata';
/**
 * useTheme composable — small compatibility wrapper over the canonical settings
 * store for components that only need theme controls.
 */
import { computed } from 'vue';
import {
  updateExtensionSettings,
  useExtensionSettings,
} from './settings-context';
import {
  THEME_NAMES,
} from './theme-metadata';

function createTheme() {
  const settings = useExtensionSettings();
  const theme = computed(() => settings.theme);

  function setTheme(name: ThemeName) {
    updateExtensionSettings(settings, { theme: name });
  }

  function cycleTheme() {
    const idx = THEME_NAMES.indexOf(theme.value);
    setTheme(THEME_NAMES[(idx + 1) % THEME_NAMES.length] ?? THEME_NAMES[0]);
  }

  return { theme, setTheme, cycleTheme };
}

export function useTheme(): {
  theme: ComputedRef<ThemeName>;
  setTheme: (name: ThemeName) => void;
  cycleTheme: () => void;
} {
  return createTheme();
}
