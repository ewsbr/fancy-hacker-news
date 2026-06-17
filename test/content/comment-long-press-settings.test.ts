// @vitest-environment jsdom

import { onLongPress } from '@vueuse/core';
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, ref } from 'vue';
import {
  provideCommentCollapseRegistry,
  useCommentCollapseRegistry,
  useDelegatedCommentLongPress,
} from '@/content/composables/comment-node';
import { makeDefaultSettings } from '@/state/settings';
import {
  createExtensionSettingsState,
  EXTENSION_SETTINGS_KEY,
  useExtensionSettings,
} from '@/state/settings-context';

vi.mock('@vueuse/core', async () => {
  const actual = await vi.importActual<typeof import('@vueuse/core')>('@vueuse/core');

  return {
    ...actual,
    onLongPress: vi.fn(),
  };
});

function mountHarness(longPressCommentCollapse: boolean) {
  let providedRegistry: unknown;
  let inheritedRegistry: unknown;
  const settings = createExtensionSettingsState({
    ...makeDefaultSettings({ systemTheme: 'light' }),
    features: {
      scrollToTop: true,
      longPressCommentCollapse,
    },
  });
  const RegistryConsumer = defineComponent({
    setup() {
      inheritedRegistry = useCommentCollapseRegistry();

      return () => h('div');
    },
  });
  const Harness = defineComponent({
    setup() {
      const target = ref<HTMLElement | null>(null);
      const runtimeSettings = useExtensionSettings();
      const registry = provideCommentCollapseRegistry(runtimeSettings.features.longPressCommentCollapse);
      providedRegistry = registry;

      useDelegatedCommentLongPress(target, registry);

      return () => h('div', { ref: target }, [h(RegistryConsumer)]);
    },
  });

  const wrapper = mount(Harness, {
    global: {
      provide: {
        [EXTENSION_SETTINGS_KEY as symbol]: settings,
      },
    },
  });

  return {
    inheritedRegistry: () => inheritedRegistry,
    providedRegistry: () => providedRegistry,
    wrapper,
  };
}

describe('comment long-press settings', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('skips delegated long-press setup when disabled', () => {
    const harness = mountHarness(false);

    expect(onLongPress).not.toHaveBeenCalled();
    expect(harness.providedRegistry()).toBeNull();
    expect(harness.inheritedRegistry()).toBeNull();
  });

  it('sets up delegated long-press handling when enabled', () => {
    const harness = mountHarness(true);

    expect(onLongPress).toHaveBeenCalledTimes(1);
    expect(harness.providedRegistry()).not.toBeNull();
    expect(harness.inheritedRegistry()).not.toBeNull();
  });
});
