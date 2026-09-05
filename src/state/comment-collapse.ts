import type { Ref } from 'vue';
import { computed, ref } from 'vue';
import { COMMENT_COLLAPSED_GRAY_LEVELS } from '@/constants/comment-rendering';

export function isCommentInitiallyCollapsed(node: { isCollapsed: boolean; grayLevel: string | null }) {
  return node.isCollapsed || COMMENT_COLLAPSED_GRAY_LEVELS.has(node.grayLevel?.toLowerCase() ?? '');
}

interface CommentCollapseOptions {
  initialCollapsed: boolean;
  forceExpanded: Ref<boolean>;
  hashNavigationVersion: Ref<number>;
}

export function useCommentCollapse({
  initialCollapsed,
  forceExpanded,
  hashNavigationVersion,
}: CommentCollapseOptions) {
  const userCollapsed = ref(initialCollapsed);
  const userOverrideHashNavigationVersion = ref<number | null>(null);
  const hasUserOverride = computed(() => (
    userOverrideHashNavigationVersion.value === hashNavigationVersion.value
  ));

  const isCollapsed = computed(() => {
    if (hasUserOverride.value) {
      return userCollapsed.value;
    }

    return !forceExpanded.value && userCollapsed.value;
  });

  function toggleCollapse() {
    userCollapsed.value = !isCollapsed.value;
    userOverrideHashNavigationVersion.value = hashNavigationVersion.value;
  }

  return {
    isCollapsed,
    toggleCollapse,
  };
}
