import { ref } from 'vue';
import { describe, expect, it } from 'vitest';
import { useCommentCollapse } from '@/state/comment-collapse';

describe('useCommentCollapse', () => {
  it('allows a user toggle to collapse a comment forced open for the current fragment', () => {
    const forceExpanded = ref(true);
    const hashNavigationVersion = ref(1);
    const { isCollapsed, toggleCollapse } = useCommentCollapse({
      initialCollapsed: false,
      forceExpanded,
      hashNavigationVersion,
    });

    expect(isCollapsed.value).toBe(false);

    toggleCollapse();

    expect(isCollapsed.value).toBe(true);

    toggleCollapse();

    expect(isCollapsed.value).toBe(false);
  });

  it('clears the user override when fragment navigation changes', () => {
    const forceExpanded = ref(true);
    const hashNavigationVersion = ref(1);
    const { isCollapsed, toggleCollapse } = useCommentCollapse({
      initialCollapsed: false,
      forceExpanded,
      hashNavigationVersion,
    });

    toggleCollapse();
    expect(isCollapsed.value).toBe(true);

    hashNavigationVersion.value += 1;

    expect(isCollapsed.value).toBe(false);
  });
});
