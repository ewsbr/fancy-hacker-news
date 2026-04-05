// Runs at document_start — before any HTML has been parsed or painted.
// Hides the original HN wrapper immediately and seeds the page background with
// the best-known theme so large item pages do not flash the wrong palette while
// the main content script parses and mounts.
const STORAGE_KEY = 'fancy-hn-theme';
const DATASET_KEY = 'fancyHnTheme';
const VALID_THEMES = new Set(['light', 'dark', 'nord', 'amoled']);
const THEME_COLORS = {
  light: {
    bg: '#f6f6ef',
    text: '#111111',
    scheme: 'light',
  },
  dark: {
    bg: '#1e1e1e',
    text: '#e3e3e3',
    scheme: 'dark',
  },
  nord: {
    bg: '#2e3440',
    text: '#eceff4',
    scheme: 'dark',
  },
  amoled: {
    bg: '#000000',
    text: '#e0e0e0',
    scheme: 'dark',
  },
};

const antiFoucStyle = Object.assign(document.createElement('style'), {
  id: 'hn-anti-fouc',
});

function detectSystemTheme() {
  return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

function isThemeName(value) {
  return typeof value === 'string' && VALID_THEMES.has(value);
}

function applyBootTheme(theme) {
  const palette = THEME_COLORS[theme];
  const host = document.getElementById('fancy-hn-root');
  document.documentElement.dataset[DATASET_KEY] = theme;
  if (host) {
    if (theme === 'light') {
      host.removeAttribute('data-theme');
    } else {
      host.setAttribute('data-theme', theme);
    }
  }
  antiFoucStyle.textContent = [
    'body>center{display:none!important}',
    `html,body{background:${palette.bg}!important;color:${palette.text}!important;color-scheme:${palette.scheme}!important;}`,
    `#fancy-hn-root{background:${palette.bg}!important;color:${palette.text}!important;}`,
  ].join('');
}

applyBootTheme(detectSystemTheme());
document.documentElement.appendChild(antiFoucStyle);

try {
  chrome.storage.local.get(STORAGE_KEY, result => {
    const stored = result?.[STORAGE_KEY];
    if (isThemeName(stored)) {
      applyBootTheme(stored);
    }
  });
} catch {
  // chrome.storage may not be available in dev
}
