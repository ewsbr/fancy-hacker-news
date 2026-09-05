// @vitest-environment jsdom

import type { VNode } from 'vue';
import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref, shallowRef } from 'vue';
import { provideCommentRendering, useProgressiveComments } from '@/content/composables/comment-rendering';
import { COMMENT_FRAGMENT_STATE_KEY } from '@/state/fragment-state';

interface Node {
  id: string;
  children: Node[];
}

const List = defineComponent({
  props: { nodes: { type: Array<Node>, required: true } },
  setup(props) {
    const visible = useProgressiveComments(() => props.nodes);
    return (): VNode => h('div', visible.value.map(node => h('article', { id: node.id }, [
      node.id,
      h(List, { nodes: node.children }),
    ])));
  },
});

function makeNodes(count: number): Node[] {
  return Array.from({ length: count }, (_, index) => ({ id: `comment-${index}`, children: [] }));
}

function mountTree(nodes: Node[]) {
  const hashPathIds = shallowRef(new Set<string>());
  const Harness = defineComponent({
    setup() {
      const { isRendering } = provideCommentRendering(nodes);
      return () => h('section', { 'aria-busy': isRendering.value }, h(List, { nodes }));
    },
  });
  const wrapper = mount(Harness, {
    global: { provide: { [COMMENT_FRAGMENT_STATE_KEY as symbol]: {
      hashPathIds,
      hashTargetId: ref(null),
      mainThreadHashTargetId: ref(null),
      hashNavigationVersion: ref(0),
    } } },
  });
  return { wrapper, hashPathIds };
}

describe('progressive comment rendering', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => window.setTimeout(() => callback(performance.now()), 16));
    vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('paints a prefix, then completes the tree in source order without user input', async () => {
    const nodes = makeNodes(180);
    const { wrapper } = mountTree(nodes);
    const initialCount = wrapper.findAll('article').length;
    expect(initialCount).toBeGreaterThan(0);
    expect(initialCount).toBeLessThan(nodes.length);
    await nextTick();
    expect(wrapper.findAll('article')).toHaveLength(initialCount);

    await vi.runAllTimersAsync();
    expect(wrapper.findAll('article').map(node => node.attributes('id'))).toEqual(nodes.map(node => node.id));
    expect(wrapper.attributes('aria-busy')).toBe('false');
    wrapper.unmount();
  });

  it('shares the initial budget with a large nested branch', async () => {
    const children = makeNodes(180);
    const { wrapper } = mountTree([{ id: 'root', children }]);
    expect(wrapper.findAll('article').length).toBeLessThan(children.length);
    expect(wrapper.find('#root').exists()).toBe(true);
    await vi.runAllTimersAsync();
    expect(wrapper.findAll('article')).toHaveLength(children.length + 1);
    wrapper.unmount();
  });

  it('renders fragment ancestors and targets immediately while work is queued', async () => {
    const nodes = makeNodes(180);
    nodes[150].children = [{ id: 'target', children: [] }];
    const { wrapper, hashPathIds } = mountTree(nodes);
    expect(wrapper.find('#target').exists()).toBe(false);
    hashPathIds.value = new Set(['comment-150', 'target']);
    await nextTick();
    expect(wrapper.find('#target').exists()).toBe(true);
    hashPathIds.value = new Set();
    await nextTick();
    expect(wrapper.find('#target').exists()).toBe(true);
    wrapper.unmount();
    await vi.runAllTimersAsync();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('renders small trees synchronously and cancels unfinished work on unmount', async () => {
    const small = mountTree(makeNodes(3));
    expect(small.wrapper.findAll('article')).toHaveLength(3);
    small.wrapper.unmount();
    const large = mountTree(makeNodes(180));
    large.wrapper.unmount();
    await vi.runAllTimersAsync();
    expect(vi.getTimerCount()).toBe(0);
  });
});
