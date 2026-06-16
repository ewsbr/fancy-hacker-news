import {
  LEGACY_THEME_STORAGE_KEY,
  resolveStoredSettings,
  SETTINGS_STORAGE_KEY,
} from '@/state/settings';
import {
  applyBootTheme,
  detectSystemTheme,
  getBootThemeStyleElement,
} from './theme-bootstrap';
import { ensureResponsiveViewport } from './utils/viewport';

ensureResponsiveViewport(document);

const antiFoucStyle = getBootThemeStyleElement(document);

applyBootTheme(document, antiFoucStyle, detectSystemTheme());
document.documentElement.appendChild(antiFoucStyle);

try {
  chrome.storage.local.get([SETTINGS_STORAGE_KEY, LEGACY_THEME_STORAGE_KEY], (result) => {
    const resolved = resolveStoredSettings(
      result?.[SETTINGS_STORAGE_KEY],
      result?.[LEGACY_THEME_STORAGE_KEY],
      { systemTheme: detectSystemTheme() },
    );

    applyBootTheme(document, antiFoucStyle, resolved.settings.theme);
  });
}
catch (error) {
  if (error instanceof ReferenceError) {
    // chrome.storage is not available on the local design/test pages.
  }
  else {
    throw error;
  }
}
