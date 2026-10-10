import type { ThemeName } from './theme-metadata';
import { z } from 'zod';
import { applyThemeToHost, BOOTSTRAP_THEME_DATASET_KEY, isThemeName } from './theme-metadata';

export const SETTINGS_STORAGE_KEY = 'fancy-hn-settings';
export const LEGACY_THEME_STORAGE_KEY = 'fancy-hn-theme';
export const SETTINGS_SCHEMA_VERSION = 1;

const CONTENT_WIDTH_NAMES = ['compact', 'default', 'wide', 'fluid'] as const;
export type ContentWidth = typeof CONTENT_WIDTH_NAMES[number];

export const CONTENT_WIDTH_PRESETS: { name: ContentWidth; label: string; value: string; displayValue?: string }[] = [
  { name: 'compact', label: 'Compact', value: '860px' },
  { name: 'default', label: 'Default', value: '1024px' },
  { name: 'wide', label: 'Wide', value: '1200px' },
  { name: 'fluid', label: 'Fluid', value: 'min(1440px, calc(100vw - 32px))', displayValue: '1440px' },
];

export const extensionSettingsSchema = z.object({
  schemaVersion: z.literal(SETTINGS_SCHEMA_VERSION),
  theme: z.custom<ThemeName>(isThemeName, { message: 'Expected a valid Fancy HN theme name.' }),
  contentWidth: z.enum(CONTENT_WIDTH_NAMES),
  features: z.object({
    scrollToTop: z.boolean(),
    longPressCommentCollapse: z.boolean(),
    openLinksInNewTab: z.boolean().default(false),
  }).strict(),
}).strict();

export type ExtensionSettings = z.infer<typeof extensionSettingsSchema>;
export type FeatureSettings = ExtensionSettings['features'];

export function detectSystemTheme(): ThemeName {
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function makeDefaultSettings(options?: { legacyTheme?: unknown; systemTheme?: ThemeName }): ExtensionSettings {
  return {
    schemaVersion: SETTINGS_SCHEMA_VERSION,
    theme: isThemeName(options?.legacyTheme) ? options.legacyTheme : options?.systemTheme ?? detectSystemTheme(),
    contentWidth: 'default',
    features: {
      scrollToTop: true,
      longPressCommentCollapse: true,
      openLinksInNewTab: false,
    },
  };
}

/** Returns a validated plain copy, or null when the value is not valid settings. */
export function parseStoredSettings(value: unknown): ExtensionSettings | null {
  const result = extensionSettingsSchema.safeParse(value);
  return result.success ? result.data : null;
}

export function resolveStoredSettings(
  storedSettings: unknown,
  legacyTheme: unknown,
  systemTheme?: ThemeName,
): ExtensionSettings {
  return parseStoredSettings(storedSettings) ?? makeDefaultSettings({ legacyTheme, systemTheme });
}

function withStorageError<T>(action: string, call: (done: (value: T) => void) => void): Promise<T> {
  return new Promise((resolve, reject) => {
    call((value) => {
      const error = chrome.runtime.lastError;
      if (error) {
        reject(new Error(`Failed to ${action} Fancy HN settings: ${error.message}`));
      } else {
        resolve(value);
      }
    });
  });
}

export function saveExtensionSettings(settings: ExtensionSettings): Promise<void> {
  // Parsing also unwraps reactive proxies, which extension storage cannot clone.
  const value = extensionSettingsSchema.parse(settings);
  return withStorageError('write', done => chrome.storage.local.set({ [SETTINGS_STORAGE_KEY]: value }, done));
}

export async function loadExtensionSettings(): Promise<ExtensionSettings> {
  const result = await withStorageError<Record<string, unknown>>('read', done => (
    chrome.storage.local.get([SETTINGS_STORAGE_KEY, LEGACY_THEME_STORAGE_KEY], done)
  ));
  const storedSettings = parseStoredSettings(result[SETTINGS_STORAGE_KEY]);
  if (storedSettings) {
    return storedSettings;
  }

  const settings = makeDefaultSettings({ legacyTheme: result[LEGACY_THEME_STORAGE_KEY] });
  await saveExtensionSettings(settings);
  return settings;
}

export function applySettingsToHost(host: HTMLElement, settings: ExtensionSettings) {
  host.ownerDocument.documentElement.dataset[BOOTSTRAP_THEME_DATASET_KEY] = settings.theme;
  applyThemeToHost(host, settings.theme);
  host.style.setProperty(
    '--fhn-content-max-width',
    CONTENT_WIDTH_PRESETS.find(preset => preset.name === settings.contentWidth)!.value,
  );
}
