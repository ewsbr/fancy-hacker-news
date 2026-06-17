import { z } from 'zod';
import {
  applyThemeToHost,
  BOOTSTRAP_THEME_DATASET_KEY,
  isThemeName,
} from './theme-metadata';
import type { ThemeName } from './theme-metadata';

export const SETTINGS_STORAGE_KEY = 'fancy-hn-settings';
export const LEGACY_THEME_STORAGE_KEY = 'fancy-hn-theme';
export const SETTINGS_SCHEMA_VERSION = 1;

export const CONTENT_WIDTH_NAMES = ['compact', 'default', 'wide', 'fluid'] as const;
export type ContentWidth = typeof CONTENT_WIDTH_NAMES[number];

export interface ContentWidthPreset {
  name: ContentWidth;
  label: string;
  value: string;
  displayValue?: string;
}

export const CONTENT_WIDTH_PRESETS: ReadonlyArray<ContentWidthPreset> = Object.freeze([
  {
    name: 'compact',
    label: 'Compact',
    value: '860px',
  },
  {
    name: 'default',
    label: 'Default',
    value: '1024px',
  },
  {
    name: 'wide',
    label: 'Wide',
    value: '1200px',
  },
  {
    name: 'fluid',
    label: 'Fluid',
    value: 'min(1440px, calc(100vw - 32px))',
    displayValue: '1440px',
  },
]);

export const CONTENT_WIDTH_VALUES = Object.freeze(
  Object.fromEntries(
    CONTENT_WIDTH_PRESETS.map(preset => [preset.name, preset.value]),
  ) as Record<ContentWidth, string>,
);

export interface FeatureSettings {
  scrollToTop: boolean;
  longPressCommentCollapse: boolean;
  openLinksInNewTab: boolean;
}

export interface ExtensionSettings {
  schemaVersion: typeof SETTINGS_SCHEMA_VERSION;
  theme: ThemeName;
  contentWidth: ContentWidth;
  features: FeatureSettings;
}

export interface ResolvedStoredSettings {
  settings: ExtensionSettings;
  source: 'stored' | 'legacy-theme' | 'defaults';
  shouldPersist: boolean;
}

const contentWidthSchema = z.enum(CONTENT_WIDTH_NAMES);
const themeNameSchema = z.custom<ThemeName>(isThemeName, {
  message: 'Expected a valid Fancy HN theme name.',
});

export const extensionSettingsSchema = z.object({
  schemaVersion: z.literal(SETTINGS_SCHEMA_VERSION),
  theme: themeNameSchema,
  contentWidth: contentWidthSchema,
  features: z.object({
    scrollToTop: z.boolean(),
    longPressCommentCollapse: z.boolean(),
    openLinksInNewTab: z.boolean().default(false),
  }).strict(),
}).strict();

export function detectSystemTheme(): ThemeName {
  return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function cloneExtensionSettings(settings: ExtensionSettings): ExtensionSettings {
  return {
    schemaVersion: SETTINGS_SCHEMA_VERSION,
    theme: settings.theme,
    contentWidth: settings.contentWidth,
    features: {
      scrollToTop: settings.features.scrollToTop,
      longPressCommentCollapse: settings.features.longPressCommentCollapse,
      openLinksInNewTab: settings.features.openLinksInNewTab,
    },
  };
}

export function makeDefaultSettings(options?: {
  legacyTheme?: unknown;
  systemTheme?: ThemeName;
}): ExtensionSettings {
  return {
    schemaVersion: SETTINGS_SCHEMA_VERSION,
    theme: isThemeName(options?.legacyTheme)
      ? options.legacyTheme
      : options?.systemTheme ?? detectSystemTheme(),
    contentWidth: 'default',
    features: {
      scrollToTop: true,
      longPressCommentCollapse: true,
      openLinksInNewTab: false,
    },
  };
}

export function parseStoredSettings(value: unknown): ExtensionSettings | null {
  const result = extensionSettingsSchema.safeParse(value);
  if (!result.success) {
    return null;
  }

  return cloneExtensionSettings(result.data);
}

export function normalizeExtensionSettings(settings: ExtensionSettings): ExtensionSettings {
  return cloneExtensionSettings(extensionSettingsSchema.parse(settings));
}

export function resolveStoredSettings(
  storedSettings: unknown,
  legacyTheme: unknown,
  options?: { systemTheme?: ThemeName },
): ResolvedStoredSettings {
  const parsedSettings = parseStoredSettings(storedSettings);
  if (parsedSettings) {
    return {
      settings: parsedSettings,
      source: 'stored',
      shouldPersist: false,
    };
  }

  const settings = makeDefaultSettings({
    legacyTheme,
    systemTheme: options?.systemTheme,
  });

  return {
    settings,
    source: isThemeName(legacyTheme) ? 'legacy-theme' : 'defaults',
    shouldPersist: true,
  };
}

function getChromeStorageLocal(): chrome.storage.StorageArea | null {
  if (typeof chrome === 'undefined') {
    return null;
  }

  return chrome.storage?.local ?? null;
}

function getChromeRuntimeErrorMessage(): string | null {
  if (typeof chrome === 'undefined') {
    return null;
  }

  return chrome.runtime?.lastError?.message ?? null;
}

function readChromeStorage(keys: string[]): Promise<Record<string, unknown>> {
  const storage = getChromeStorageLocal();
  if (!storage) {
    return Promise.resolve({});
  }

  return new Promise((resolve, reject) => {
    storage.get(keys, (result) => {
      const errorMessage = getChromeRuntimeErrorMessage();
      if (errorMessage) {
        reject(new Error(`Failed to read Fancy HN settings: ${errorMessage}`));
        return;
      }

      resolve(result as Record<string, unknown>);
    });
  });
}

function writeChromeStorage(value: ExtensionSettings): Promise<void> {
  const storage = getChromeStorageLocal();
  if (!storage) {
    return Promise.resolve();
  }

  const settings = normalizeExtensionSettings(value);

  return new Promise((resolve, reject) => {
    storage.set({ [SETTINGS_STORAGE_KEY]: settings }, () => {
      const errorMessage = getChromeRuntimeErrorMessage();
      if (errorMessage) {
        reject(new Error(`Failed to write Fancy HN settings: ${errorMessage}`));
        return;
      }

      resolve();
    });
  });
}

export async function loadExtensionSettings(): Promise<ExtensionSettings> {
  const result = await readChromeStorage([
    SETTINGS_STORAGE_KEY,
    LEGACY_THEME_STORAGE_KEY,
  ]);
  const resolved = resolveStoredSettings(
    result[SETTINGS_STORAGE_KEY],
    result[LEGACY_THEME_STORAGE_KEY],
  );

  if (resolved.shouldPersist) {
    await writeChromeStorage(resolved.settings);
  }

  return resolved.settings;
}

export async function saveExtensionSettings(settings: ExtensionSettings): Promise<void> {
  await writeChromeStorage(settings);
}

export function applyContentWidthToHost(host: HTMLElement, contentWidth: ContentWidth) {
  host.style.setProperty('--fhn-content-max-width', CONTENT_WIDTH_VALUES[contentWidth]);
}

export function applySettingsToHost(host: HTMLElement, settings: ExtensionSettings) {
  const normalizedSettings = normalizeExtensionSettings(settings);
  const doc = host.ownerDocument;

  doc.documentElement.dataset[BOOTSTRAP_THEME_DATASET_KEY] = normalizedSettings.theme;
  applyThemeToHost(host, normalizedSettings.theme);
  applyContentWidthToHost(host, normalizedSettings.contentWidth);
}

export function applySettingsToRootHost(
  settings: ExtensionSettings,
  doc: Document = document,
) {
  const normalizedSettings = normalizeExtensionSettings(settings);
  const host = doc.getElementById('fancy-hn-root');
  const HTMLElementCtor = doc.defaultView?.HTMLElement;

  doc.documentElement.dataset[BOOTSTRAP_THEME_DATASET_KEY] = normalizedSettings.theme;

  if (host && (!HTMLElementCtor || host instanceof HTMLElementCtor)) {
    applySettingsToHost(host, normalizedSettings);
  }
}
