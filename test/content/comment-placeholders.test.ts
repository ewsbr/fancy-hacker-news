// @vitest-environment jsdom

import type { CommentNode } from '@/parsers/item';
import { mount } from '@vue/test-utils';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, ref } from 'vue';
import CommentTree from '@/content/components/comments/CommentTree.vue';
import { provideCommentHeightEstimates, useCommentPlaceholderHeight } from '@/content/composables/comment-placeholders';
import { createCommentHeightEstimator } from '@/content/utils/comment-height';
import { parseItemPage } from '@/parsers/item';
import * as htmlText from '@/utils/html-text';
import { loadFixtureDocument } from '../helpers/load-fixture';

let base: CommentNode;
beforeAll(async () => {
  base = parseItemPage(await loadFixtureDocument('stories/threads/story.html')).comments[0];
});

function node(overrides: Partial<CommentNode> = {}): CommentNode {
  return { ...base, id: 'comment', bodyHtml: 'A short comment.', children: [], isCollapsed: false, grayLevel: 'c00', lazyThread: null, expandForHash: false, ...overrides };
}

function estimator(options: Partial<Parameters<typeof createCommentHeightEstimator>[0]> = {}) {
  return createCommentHeightEstimator({ width: 900, fontSize: 16, isMobileLayout: false, inModal: false, enableMobileSubthreads: true, hashPathIds: new Set(), hashTargetId: null, ...options });
}

describe('comment height estimates', () => {
  it('counts displayed text instead of HTML attributes and increases estimates for wrapped paragraphs', () => {
    const plain = node({ bodyHtml: 'hello &amp; goodbye' });
    const linked = node({ bodyHtml: '<a href="https://example.com/a/very/long/path">hello &amp; goodbye</a>' });
    expect(estimator()(plain)).toBe(estimator()(linked));
    expect(htmlText.getHtmlTextBlocks('<p>A &amp; B</p><p>C<br>D</p>')).toEqual([
      { lineLengths: [5], preformatted: false },
      { lineLengths: [1, 1], preformatted: false },
    ]);
    const long = node({ bodyHtml: `<p>${'word '.repeat(100)}</p><p>Another paragraph.</p>` });
    expect(estimator({ width: 300 })(long)).toBeGreaterThan(estimator()(long));
    expect(estimator({ fontSize: 24 })(long)).toBeGreaterThan(estimator()(long));
  });

  it('reuses text metrics across widths, fragment navigation, and modal surfaces', () => {
    const parse = vi.spyOn(htmlText, 'getHtmlTextBlocks');
    try {
      const comment = node({ bodyHtml: 'word '.repeat(200) });
      const wide = estimator()(comment);
      expect(estimator({ width: 300 })(comment)).toBeGreaterThan(wide);
      estimator({ hashPathIds: new Set([comment.id]) })(comment);
      estimator({ inModal: true })(comment);
      expect(parse).toHaveBeenCalledTimes(1);
    } finally {
      parse.mockRestore();
    }
  });

  it('separates paragraph gaps from explicit breaks and preserves preformatted lines', () => {
    expect(htmlText.getHtmlTextBlocks('<p>A\n B<br><br>C</p><pre>  x\n\n y</pre>')).toEqual([
      { lineLengths: [3, 0, 1], preformatted: false },
      { lineLengths: [3, 0, 2], preformatted: true },
    ]);
    const breaks = estimator()(node({ bodyHtml: 'A<br>B<br>C' }));
    const code = estimator()(node({ bodyHtml: '<pre>A\nB\nC</pre>' }));
    expect(code).toBe(breaks);
    expect(estimator()(node({ bodyHtml: '<p>A</p><p>B</p><p>C</p>' }))).toBeGreaterThan(breaks);
    expect(estimator()(node({ bodyHtml: 'A\nB\nC' }))).toBe(estimator()(node({ bodyHtml: 'A B C' })));
    const longCode = node({ bodyHtml: `<pre>${'x'.repeat(500)}</pre>` });
    expect(estimator({ width: 300 })(longCode)).toBe(estimator()(longCode));
  });

  it('reserves collapsed headers and respects fragment expansion without opening a collapsed target', () => {
    const children = [node({ id: 'child', bodyHtml: 'long '.repeat(200) })];
    const collapsed = node({ isCollapsed: true, children });
    expect(estimator()(collapsed)).toBe(estimator()(node({ isCollapsed: true })));
    expect(estimator()(node({ grayLevel: 'cDD', children }))).toBe(estimator()(collapsed));
    expect(estimator({ hashPathIds: new Set(['comment']) })(collapsed)).toBeGreaterThan(estimator()(collapsed));
    expect(estimator({ hashPathIds: new Set(['comment']), hashTargetId: 'comment' })(collapsed)).toBe(estimator()(collapsed));
  });

  it('reserves mobile inline replies only up to the subthread control, including all replies inside a modal', () => {
    const short = node({ children: [node({ id: 'child' })] });
    const long = node({ children: [node({ id: 'child', bodyHtml: 'long '.repeat(500) })] });
    const mobile = estimator({ isMobileLayout: true });
    expect(mobile(short, 4)).toBe(mobile(long, 4));
    expect(estimator({ isMobileLayout: true, inModal: true })(long, 4)).toBeGreaterThan(mobile(long, 4));
    expect(estimator({ isMobileLayout: true, enableMobileSubthreads: false })(long, 4)).toBeGreaterThan(mobile(long, 4));
  });

  it('does not estimate unopened deferred replies or consume source rows', async () => {
    const page = parseItemPage(await loadFixtureDocument('stories/threads/story.html'), { extremeThreadCommentThreshold: 0 });
    const deferred = page.comments.find(comment => comment.lazyThread)!;
    const state = deferred.lazyThread!.state;
    const estimate = estimator();
    expect(estimate(deferred)).toBe(estimate({ ...deferred, descendantCount: deferred.descendantCount * 100 }));
    expect(deferred.lazyThread!.state).toBe(state);
    expect(state.kind).toBe('pending');
  });
});

describe('batched comment placeholders', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => window.setTimeout(() => callback(performance.now()), 16));
    vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('replaces root and nested placeholders with comments, preserving order and leaving no spacer behind', async () => {
    const comments = Array.from({ length: 35 }, (_, index) => node({ id: `root-${index}` }));
    comments[0].children = Array.from({ length: 30 }, (_, index) => node({ id: `reply-${index}` }));
    const wrapper = mount(CommentTree, { props: { comments } });
    expect(wrapper.find('.comment-tree > .comment-placeholder').exists()).toBe(true);
    expect(wrapper.find('.comment-node__children > .comment-placeholder').exists()).toBe(true);
    expect(wrapper.find('.comment-placeholder').attributes('aria-hidden')).toBe('true');
    await vi.runAllTimersAsync();
    expect(wrapper.findAll('.comment-placeholder')).toHaveLength(0);
    expect(wrapper.findAll('.comment-tree > .comment-node').map(element => element.attributes('id'))).toEqual(comments.map(comment => comment.id));
    wrapper.unmount();
  });

  it('removes exactly the next estimated comment and its gap as the visible prefix grows', () => {
    const comments = [node(), node({ id: 'second', bodyHtml: 'long '.repeat(200) }), node({ id: 'third' })];
    const visible = ref(1);
    let pending!: ReturnType<typeof useCommentPlaceholderHeight>;
    let estimate!: ReturnType<typeof provideCommentHeightEstimates>;
    const Child = defineComponent({
      setup() {
        pending = useCommentPlaceholderHeight(() => comments, () => visible.value, 0, 4);
        return () => h('div');
      },
    });
    const wrapper = mount(defineComponent({
      setup() {
        estimate = provideCommentHeightEstimates(ref(null));
        return () => h(Child);
      },
    }));
    const initial = pending.value;
    visible.value = 2;
    expect(initial - pending.value).toBe(estimate.value(comments[1]) + 4);
    visible.value = 3;
    expect(pending.value).toBe(0);
    wrapper.unmount();
  });
});
