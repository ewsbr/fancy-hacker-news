import { detectSystemTheme, LEGACY_THEME_STORAGE_KEY, resolveStoredSettings, SETTINGS_STORAGE_KEY } from '@/state/settings';
import { applyBootTheme } from './theme-bootstrap';
import { ensureResponsiveViewport } from './utils/viewport';

ensureResponsiveViewport(document);

const antiFoucStyle = document.createElement('style');
antiFoucStyle.id = 'hn-anti-fouc';
applyBootTheme(document, antiFoucStyle, detectSystemTheme());
document.documentElement.appendChild(antiFoucStyle);

chrome.storage.local.get([SETTINGS_STORAGE_KEY, LEGACY_THEME_STORAGE_KEY], (result) => {
  const settings = resolveStoredSettings(result[SETTINGS_STORAGE_KEY], result[LEGACY_THEME_STORAGE_KEY]);
  applyBootTheme(document, antiFoucStyle, settings.theme);
});
