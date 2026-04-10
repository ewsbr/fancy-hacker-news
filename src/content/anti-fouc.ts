import { isThemeName } from '@/state/theme-metadata';
import {
  applyBootTheme,
  detectSystemTheme,
  getBootThemeStyleElement,
  STORAGE_KEY,
} from './theme-bootstrap';

const antiFoucStyle = getBootThemeStyleElement(document);

applyBootTheme(document, antiFoucStyle, detectSystemTheme());
document.documentElement.appendChild(antiFoucStyle);

try {
  chrome.storage.local.get(STORAGE_KEY, result => {
    const stored = result?.[STORAGE_KEY];
    if (isThemeName(stored)) {
      applyBootTheme(document, antiFoucStyle, stored);
    }
  });
} catch {
  // chrome.storage may not be available in dev
}
