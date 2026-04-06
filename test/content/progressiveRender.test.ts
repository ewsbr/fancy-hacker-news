import { describe, expect, it } from 'vitest';
import {
  nextVisibleNodeCount,
  requiredVisibleNodeCount,
  shouldProgressivelyRenderChildren,
  shouldProgressivelyRenderRoots,
} from '@/content/comments/progressiveRender';

describe('progressive comment rendering', () => {
  it('enables root batching for long item threads in the 400-comment range', () => {
    expect(shouldProgressivelyRenderRoots(200)).toBe(false);
    expect(shouldProgressivelyRenderRoots(452)).toBe(true);
  });

  it('always renders at least the first node in a batch even when it exceeds the budget', () => {
    expect(
      nextVisibleNodeCount(
        [
          { descendantCount: 250 },
          { descendantCount: 10 },
        ],
        0,
        180,
      ),
    ).toBe(1);
  });

  it('forces the rendered count to include the deepest hash-path node', () => {
    expect(
      requiredVisibleNodeCount(
        [
          { id: 'a', expandForHash: false },
          { id: 'b', expandForHash: false },
          { id: 'c', expandForHash: true },
          { id: 'd', expandForHash: false },
        ],
        new Set(['b']),
      ),
    ).toBe(3);
  });

  it('never batches modal subthreads', () => {
    expect(shouldProgressivelyRenderChildren(250, false)).toBe(true);
    expect(shouldProgressivelyRenderChildren(250, true)).toBe(false);
  });
});
