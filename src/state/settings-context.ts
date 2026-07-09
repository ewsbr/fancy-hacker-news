import type { InjectionKey } from 'vue';
import type {
  ContentWidth,
  ExtensionSettings,
  FeatureSettings,
} from './settings';
import type { ThemeName } from './theme-metadata';
import { inject, reactive } from 'vue';
import { createLogger } from '@/debug';
import {
  applySettingsToRootHost,
  cloneExtensionSettings,
  makeDefaultSettings,
  normalizeExtensionSettings,
  saveExtensionSettings,
} from './settings';

export const EXTENSION_SETTINGS_KEY: InjectionKey<ExtensionSettings> = Symbol('extension-settings');

interface ExtensionSettingsPatch {
  theme?: ThemeName;
  contentWidth?: ContentWidth;
  features?: Partial<FeatureSettings>;
}

const settingsLogger = createLogger('settings');
let fallbackSettings: ExtensionSettings | null = null;

export function createExtensionSettingsState(initialSettings: ExtensionSettings): ExtensionSettings {
  return reactive(cloneExtensionSettings(initialSettings)) as ExtensionSettings;
}

export function replaceExtensionSettingsState(
  target: ExtensionSettings,
  source: ExtensionSettings,
) {
  const settings = normalizeExtensionSettings(source);

  target.schemaVersion = settings.schemaVersion;
  target.theme = settings.theme;
  target.contentWidth = settings.contentWidth;
  target.features = {
    scrollToTop: settings.features.scrollToTop,
    longPressCommentCollapse: settings.features.longPressCommentCollapse,
    openLinksInNewTab: settings.features.openLinksInNewTab,
  };
}

export function useExtensionSettings(): ExtensionSettings {
  const settings = inject(EXTENSION_SETTINGS_KEY, null);
  if (settings) {
    return settings;
  }

  fallbackSettings ??= createExtensionSettingsState(makeDefaultSettings());
  return fallbackSettings;
}

function reportSettingsSaveError(error: unknown) {
  if (error instanceof Error) {
    settingsLogger.warn('Failed to persist settings', { error: error.message });
    return;
  }

  throw error;
}

export function updateExtensionSettings(
  settings: ExtensionSettings,
  patch: ExtensionSettingsPatch,
) {
  const current = cloneExtensionSettings(settings);
  const next = normalizeExtensionSettings({
    ...current,
    ...patch,
    features: {
      ...current.features,
      ...(patch.features ?? {}),
    },
  });

  replaceExtensionSettingsState(settings, next);
  applySettingsToRootHost(settings);

  void saveExtensionSettings(settings).catch(reportSettingsSaveError);
}
