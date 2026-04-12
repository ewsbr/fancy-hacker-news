import type { InjectionKey, Ref } from 'vue';

export interface CommentFragmentState {
  hashPathIds: Ref<Set<string>>;
  hashTargetId: Ref<string | null>;
  mainThreadHashTargetId: Ref<string | null>;
  hashNavigationVersion: Ref<number>;
}

export const COMMENT_FRAGMENT_STATE_KEY: InjectionKey<CommentFragmentState> = Symbol('comment-fragment-state');
