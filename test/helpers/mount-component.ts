import type { MountingOptions } from '@vue/test-utils';
import type { Component } from 'vue';
import { mount } from '@vue/test-utils';

export function mountComponent(
  component: Component,
  options: MountingOptions<unknown> = {},
) {
  return mount(component, {
    ...options,
    global: {
      stubs: {
        RouterLink: true,
      },
      ...options.global,
    },
  });
}
