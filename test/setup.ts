import { config } from '@vue/test-utils';
import { beforeEach } from 'vitest';
import { reactive } from 'vue';
import { makeDefaultSettings } from '@/state/settings';
import { EXTENSION_SETTINGS_KEY } from '@/state/settings-context';

// The content script always provides settings; give mounted test components the same.
beforeEach(() => {
  config.global.provide = {
    [EXTENSION_SETTINGS_KEY as symbol]: reactive(makeDefaultSettings({ systemTheme: 'light' })),
  };
});
