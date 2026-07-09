// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import ScrollToTopButton from '@/content/components/layout/ScrollToTopButton.vue';
import { mountComponent } from '../helpers/mount-component';

function createScrollRoot(scrollTop: number) {
  const root = document.createElement('div');
  root.id = 'fancy-hn-root';
  root.scrollTop = scrollTop;
  root.scrollTo = vi.fn();
  document.body.append(root);

  return root;
}

async function setScrollTop(root: HTMLElement, scrollTop: number) {
  root.scrollTop = scrollTop;
  root.dispatchEvent(new Event('scroll'));
  await nextTick();
}

describe('scrollToTopButton', () => {
  afterEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  it('is hidden at or below the scroll threshold', async () => {
    const root = createScrollRoot(280);
    const wrapper = mountComponent(ScrollToTopButton);

    expect(wrapper.find('button').exists()).toBe(false);

    await setScrollTop(root, 120);

    expect(wrapper.find('button').exists()).toBe(false);
  });

  it('shows the scroll-to-top action above the threshold', async () => {
    createScrollRoot(281);
    const wrapper = mountComponent(ScrollToTopButton);
    await nextTick();

    const button = wrapper.get('button');
    expect(button.attributes('aria-label')).toBe('Scroll to top');
    expect(button.attributes('title')).toBe('Scroll to top');
  });

  it('arms a one-shot return action after scrolling to the top threshold', async () => {
    const root = createScrollRoot(640);
    const wrapper = mountComponent(ScrollToTopButton);
    await nextTick();

    await wrapper.get('button').trigger('click');

    expect(root.scrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });

    await setScrollTop(root, 280);

    const button = wrapper.get('button');
    expect(button.attributes('aria-label')).toBe('Return to previous position');
    expect(button.attributes('title')).toBe('Return to previous position');

    await button.trigger('click');

    expect(root.scrollTo).toHaveBeenLastCalledWith({
      top: 640,
      left: 0,
      behavior: 'smooth',
    });
    expect(wrapper.find('button').exists()).toBe(false);
  });

  it('clears the armed return action when the user scrolls past the threshold', async () => {
    const root = createScrollRoot(640);
    const wrapper = mountComponent(ScrollToTopButton);
    await nextTick();

    await wrapper.get('button').trigger('click');
    await setScrollTop(root, 0);

    expect(wrapper.get('button').attributes('aria-label')).toBe('Return to previous position');

    await setScrollTop(root, 281);

    const button = wrapper.get('button');
    expect(button.attributes('aria-label')).toBe('Scroll to top');

    await button.trigger('click');

    expect(root.scrollTo).toHaveBeenLastCalledWith({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  });
});
