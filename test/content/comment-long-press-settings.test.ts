// @vitest-environment jsdom

import { onLongPress } from '@vueuse/core';
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, ref } from 'vue';
import {
  provideCommentCollapseRegistry,
  useDelegatedCommentLongPress,
} from '@/content/composables/comment-node';
import { makeDefaultSettings } from '@/state/settings';
import {
  createExtensionSettingsState,
  EXTENSION_SETTINGS_KEY,
} from '@/state/settings-context';

vi.mock('@vueuse/core', async () => {
  const actual = await vi.importActual<typeof import('@vueuse/core')>('@vueuse/core');

  return {
    ...actual,
    onLongPress: vi.fn(),
  };
});

function mountHarness(longPressCommentCollapse: boolean) {
  const settings = createExtensionSettingsState({
    ...makeDefaultSettings({ systemTheme: 'light' }),
    features: {
      scrollToTop: true,
      longPressCommentCollapse,
    },
  });
  const Harness = defineComponent({
    setup() {
      const target = ref<HTMLElement | null>(null);
      const registry = provideCommentCollapseRegistry();

      useDelegatedCommentLongPress(target, registry);

      return () => h('div', { ref: target });
    },
  });

  return mount(Harness, {
    global: {
      provide: {
        [EXTENSION_SETTINGS_KEY as symbol]: settings,
      },
    },
  });
}

describe('comment long-press settings', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('skips delegated long-press setup when disabled', () => {
    mountHarness(false);

    expect(onLongPress).not.toHaveBeenCalled();
  });

  it('sets up delegated long-press handling when enabled', () => {
    mountHarness(true);

    expect(onLongPress).toHaveBeenCalledTimes(1);
  });
});
