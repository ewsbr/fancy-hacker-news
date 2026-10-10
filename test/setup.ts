import type { ParsedHeader } from '@/parsers/header';
import { config } from '@vue/test-utils';
import { beforeEach } from 'vitest';
import { reactive } from 'vue';
import { makeDefaultSettings } from '@/state/settings';
import { EXTENSION_SETTINGS_KEY } from '@/state/settings-context';

const header: ParsedHeader = {
  navLinks: [],
  hasAuthControls: true,
  user: { name: 'tester', karma: 1 },
  loginUrl: null,
  logoutUrl: 'logout?auth=test',
  topBarColor: '#ff6600',
  hasCustomTopBarColor: false,
  hasMemorialBar: false,
  memorialBarColor: null,
};

// The content script always provides settings and the parsed header; give mounted test components the same.
beforeEach(() => {
  config.global.provide = {
    [EXTENSION_SETTINGS_KEY as symbol]: reactive(makeDefaultSettings({ systemTheme: 'light' })),
    header,
  };
});
