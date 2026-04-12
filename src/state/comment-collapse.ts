import { computed, ref, type Ref } from 'vue';

type CommentCollapseOptions = {
  initialCollapsed: boolean;
  forceExpanded: Ref<boolean>;
  hashNavigationVersion: Ref<number>;
};

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
