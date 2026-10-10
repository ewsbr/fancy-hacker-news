import type { InjectionKey } from 'vue';
import type { ExtensionSettings, FeatureSettings } from './settings';
import { inject } from 'vue';
import { getExtensionRootHost } from '@/content/utils/root-host';
import { createLogger } from '@/debug';
import { applySettingsToHost, extensionSettingsSchema, saveExtensionSettings } from './settings';

export const EXTENSION_SETTINGS_KEY: InjectionKey<ExtensionSettings> = Symbol('extension-settings');

const logger = createLogger('settings');

export function useExtensionSettings(): ExtensionSettings {
  return inject(EXTENSION_SETTINGS_KEY)!;
}

export function updateExtensionSettings(
  settings: ExtensionSettings,
  patch: Partial<Omit<ExtensionSettings, 'features'>> & { features?: Partial<FeatureSettings> },
) {
  Object.assign(settings, extensionSettingsSchema.parse({
    ...settings,
    ...patch,
    features: { ...settings.features, ...patch.features },
  }));
  const host = getExtensionRootHost();
  if (host) {
    applySettingsToHost(host, settings);
  }

  saveExtensionSettings(settings).catch(error => logger.warn('Failed to persist settings', error));
}
