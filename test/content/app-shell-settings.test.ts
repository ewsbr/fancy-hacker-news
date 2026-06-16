// @vitest-environment jsdom

import type { ParsedHeader } from '@/parsers/header';
import { afterEach, describe, expect, it } from 'vitest';
import AppShell from '@/content/components/layout/AppShell.vue';
import ScrollToTopButton from '@/content/components/layout/ScrollToTopButton.vue';
import { makeDefaultSettings } from '@/state/settings';
import {
  createExtensionSettingsState,
  EXTENSION_SETTINGS_KEY,
} from '@/state/settings-context';
import { mountComponent } from '../helpers/mount-component';

const header: ParsedHeader = {
  navLinks: [],
  hasAuthControls: false,
  user: null,
  loginUrl: null,
  logoutUrl: null,
  topBarColor: '#ff6600',
  hasCustomTopBarColor: false,
  hasMemorialBar: false,
  memorialBarColor: null,
};

function mountShell(scrollToTop: boolean) {
  const settings = createExtensionSettingsState({
    ...makeDefaultSettings({ systemTheme: 'light' }),
    features: {
      scrollToTop,
      longPressCommentCollapse: true,
    },
  });

  return mountComponent(AppShell, {
    slots: {
      default: '<div />',
    },
    global: {
      provide: {
        [EXTENSION_SETTINGS_KEY as symbol]: settings,
        header,
      },
      stubs: {
        SearchModal: true,
        SiteFooter: true,
        SiteHeader: true,
      },
    },
  });
}

describe('AppShell settings', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('does not render the scroll-to-top component when disabled', () => {
    const wrapper = mountShell(false);

    expect(wrapper.findComponent(ScrollToTopButton).exists()).toBe(false);
  });

  it('keeps the scroll-to-top component mounted when enabled', () => {
    const wrapper = mountShell(true);

    expect(wrapper.findComponent(ScrollToTopButton).exists()).toBe(true);
  });
});
