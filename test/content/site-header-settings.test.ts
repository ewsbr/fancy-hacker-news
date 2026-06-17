// @vitest-environment jsdom

import type { ParsedHeader } from '@/parsers/header';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SiteHeader from '@/content/components/layout/SiteHeader.vue';
import { makeOpenSettingsMessage } from '@/utils/extension-messages';
import { mountComponent } from '../helpers/mount-component';

const header: ParsedHeader = {
  navLinks: [
    { label: 'Hacker News', href: 'news', active: false },
    { label: 'new', href: 'newest', active: false },
  ],
  hasAuthControls: false,
  user: null,
  loginUrl: null,
  logoutUrl: null,
  topBarColor: '#ff6600',
  hasCustomTopBarColor: false,
  hasMemorialBar: false,
  memorialBarColor: null,
};

describe('SiteHeader settings', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    document.body.replaceChildren();
  });

  it('opens the extension settings page from an icon-only button', async () => {
    const sendMessage = vi.fn((_message: unknown, callback: (response: unknown) => void) => {
      callback({ ok: true });
    });
    vi.stubGlobal('chrome', {
      runtime: {
        sendMessage,
      },
    });

    const wrapper = mountComponent(SiteHeader, {
      global: {
        provide: {
          header,
        },
        stubs: {
          HeaderMoreDropdown: true,
          ThemeToggle: true,
        },
      },
    });

    const settingsButton = wrapper.get('button[aria-label="Open settings"]');

    expect(settingsButton.text()).toBe('');

    await settingsButton.trigger('click');

    expect(sendMessage).toHaveBeenCalledWith(makeOpenSettingsMessage(), expect.any(Function));
  });
});
