// @vitest-environment jsdom

import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { isReactive, reactive } from 'vue';
import LazyCommentRoot from '@/content/components/comments/LazyCommentRoot.vue';
import { parseItemPage } from '@/parsers/item';
import { detachDeferredCommentRows, loadDeferredCommentThread, makeItemPageReactive } from '@/state/item-page-state';
import { assertDefined } from '@/utils/assert';
import { loadFixtureDocument } from '../helpers/load-fixture';

describe('deferred comment source ownership', () => {
  it('preserves the original page until cleanup and produces the same models as eager parsing', async () => {
    const doc = await loadFixtureDocument('stories/threads/story.html');
    const original = doc.body.innerHTML;
    const eager = parseItemPage(doc);
    const page = makeItemPageReactive(parseItemPage(doc, { extremeThreadCommentThreshold: 0 }));
    expect(() => detachDeferredCommentRows(page)).toThrow('before source cleanup');
    expect(doc.body.innerHTML).toBe(original);

    const rows = page.comments.flatMap(node => node.lazyThread?.state.kind === 'pending' ? node.lazyThread.state.rows : []);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every(row => row.isConnected)).toBe(true);

    doc.body.replaceChildren();
    detachDeferredCommentRows(page);
    // No retained row can keep the source table or another thread alive.
    expect(rows.every(row => row.parentNode === null)).toBe(true);

    const loaded = page.comments.map(node => node.lazyThread ? loadDeferredCommentThread(node.lazyThread) : node);
    expect(loaded).toEqual(eager.comments);
    for (const node of page.comments) {
      if (!node.lazyThread) continue;
      expect(isReactive(reactive(node.lazyThread))).toBe(false);
      expect(node.lazyThread.state.kind).toBe('loaded');
      const cached = loadDeferredCommentThread(node.lazyThread);
      expect(loadDeferredCommentThread(node.lazyThread)).toBe(cached);
      expect(isReactive(reactive(cached))).toBe(false);
      expect(isReactive(reactive(cached.children))).toBe(false);
    }
  });

  it('keeps rows available for retry if parsing fails, including a load before cleanup', async () => {
    const doc = await loadFixtureDocument('stories/threads/story.html');
    const page = parseItemPage(doc, { extremeThreadCommentThreshold: 0 });
    const thread = assertDefined(page.comments.find(node => node.lazyThread)?.lazyThread, 'Fixture must have replies');
    const pending = thread.state;
    if (pending.kind !== 'pending') throw new Error('Expected source rows');
    const row = pending.rows[1];
    const id = row.id;
    row.removeAttribute('id');
    expect(() => loadDeferredCommentThread(thread)).toThrow('Expected comment row to have an id');
    expect(thread.state).toBe(pending);

    row.id = id;
    const root = loadDeferredCommentThread(thread);
    expect(root.children.length).toBeGreaterThan(0);
    expect(pending.rows.every(row => row.isConnected)).toBe(true);
    doc.body.replaceChildren();
    detachDeferredCommentRows(page);
    expect(loadDeferredCommentThread(thread)).toBe(root);
  });

  it('reuses the loaded model when the component remounts after source release', async () => {
    const doc = await loadFixtureDocument('stories/threads/story.html');
    const page = makeItemPageReactive(parseItemPage(doc, { extremeThreadCommentThreshold: 0 }));
    const node = assertDefined(page.comments.find(node => node.lazyThread), 'Fixture must have replies');
    doc.body.replaceChildren();
    detachDeferredCommentRows(page);

    const options = { props: { node } };
    const wrapper = mount(LazyCommentRoot, options);
    await wrapper.get('.lazy-comment-root__thread-btn').trigger('click');
    const loadedCount = wrapper.findAll('.comment-node').length;
    expect(loadedCount).toBeGreaterThan(1);
    expect(wrapper.find('.lazy-comment-root__thread-btn').exists()).toBe(false);
    wrapper.unmount();

    const remounted = mount(LazyCommentRoot, options);
    expect(remounted.findAll('.comment-node')).toHaveLength(loadedCount);
    expect(remounted.find('.lazy-comment-root__thread-btn').exists()).toBe(false);
    remounted.unmount();
  });
});
