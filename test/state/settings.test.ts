import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  LEGACY_THEME_STORAGE_KEY,
  loadExtensionSettings,
  makeDefaultSettings,
  parseStoredSettings,
  resolveStoredSettings,
  SETTINGS_SCHEMA_VERSION,
  SETTINGS_STORAGE_KEY,
} from '@/state/settings';
import type { ExtensionSettings } from '@/state/settings';

function makeSettings(overrides: Partial<ExtensionSettings> = {}): ExtensionSettings {
  return {
    schemaVersion: SETTINGS_SCHEMA_VERSION,
    theme: 'dark',
    contentWidth: 'wide',
    features: {
      scrollToTop: true,
      longPressCommentCollapse: false,
      openLinksInNewTab: true,
    },
    ...overrides,
  };
}

function installChromeStorage(initialValues: Record<string, unknown>) {
  const storedValues = { ...initialValues };
  const local = {
    get: vi.fn((keys: string[], callback: (result: Record<string, unknown>) => void) => {
      callback(Object.fromEntries(
        keys
          .filter(key => key in storedValues)
          .map(key => [key, storedValues[key]]),
      ));
    }),
    set: vi.fn((values: Record<string, unknown>, callback?: () => void) => {
      Object.assign(storedValues, values);
      callback?.();
    }),
  };

  vi.stubGlobal('chrome', {
    runtime: {},
    storage: {
      local,
    },
  });

  return { local, storedValues };
}

describe('extension settings', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('round-trips valid stored settings', () => {
    const settings = makeSettings();

    expect(parseStoredSettings(settings)).toEqual(settings);
  });

  it('falls back to defaults for malformed stored settings', () => {
    const resolved = resolveStoredSettings(
      { schemaVersion: SETTINGS_SCHEMA_VERSION, theme: 'dark' },
      null,
      { systemTheme: 'light' },
    );

    expect(resolved).toEqual({
      settings: makeDefaultSettings({ systemTheme: 'light' }),
      source: 'defaults',
      shouldPersist: true,
    });
  });

  it('defaults new-tab links off for stored settings from before the feature existed', () => {
    const storedSettings = {
      schemaVersion: SETTINGS_SCHEMA_VERSION,
      theme: 'dark',
      contentWidth: 'wide',
      features: {
        scrollToTop: true,
        longPressCommentCollapse: false,
      },
    };

    expect(parseStoredSettings(storedSettings)).toEqual({
      ...storedSettings,
      features: {
        ...storedSettings.features,
        openLinksInNewTab: false,
      },
    });
  });

  it('migrates a valid legacy theme into canonical settings', async () => {
    const { local, storedValues } = installChromeStorage({
      [LEGACY_THEME_STORAGE_KEY]: 'nord',
    });

    const settings = await loadExtensionSettings();

    expect(settings).toEqual(makeDefaultSettings({ legacyTheme: 'nord' }));
    expect(local.set).toHaveBeenCalledWith(
      { [SETTINGS_STORAGE_KEY]: settings },
      expect.any(Function),
    );
    expect(storedValues[SETTINGS_STORAGE_KEY]).toEqual(settings);
  });

  it('rejects invalid theme, width, and feature values', () => {
    expect(parseStoredSettings(makeSettings({ theme: 'sepia' as ExtensionSettings['theme'] }))).toBeNull();
    expect(parseStoredSettings(makeSettings({ contentWidth: 'narrow' as ExtensionSettings['contentWidth'] }))).toBeNull();
    expect(parseStoredSettings({
      ...makeSettings(),
      features: {
        scrollToTop: true,
        longPressCommentCollapse: 'yes',
        openLinksInNewTab: false,
      },
    })).toBeNull();
  });
});
