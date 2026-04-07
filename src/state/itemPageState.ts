import { markRaw, reactive, type InjectionKey } from 'vue';
import type { FlagActionTarget, VoteActionTarget } from '@/content/composables/useHnActions';
import type { CommentNode, ParsedItemPage } from '@/parsers/item';

export interface CommentActionState extends VoteActionTarget, FlagActionTarget {}

export type CommentActionStateStore = Map<string, CommentActionState>;

export const COMMENT_ACTION_STATE_KEY: InjectionKey<CommentActionStateStore> = Symbol('comment-action-state');

function markCommentTreeRaw(nodes: CommentNode[]): CommentNode[] {
  for (const node of nodes) {
    markCommentTreeRaw(node.children);
    markRaw(node.children);
    markRaw(node.navLinks);
    markRaw(node);
  }

  return markRaw(nodes);
}

export function makeItemPageReactive(pageData: ParsedItemPage): ParsedItemPage {
  markCommentTreeRaw(pageData.comments);

  return reactive({
    ...pageData,
    comments: pageData.comments,
  }) as ParsedItemPage;
}

export function createCommentActionStateStore(): CommentActionStateStore {
  return new Map();
}

export function getCommentActionState(
  store: CommentActionStateStore,
  node: Pick<CommentNode, 'id' | 'voteUn' | 'flagUrl' | 'isFlagged'>,
): CommentActionState {
  const existing = store.get(node.id);
  if (existing) {
    return existing;
  }

  const state = reactive({
    voteUp: null,
    voteDown: null,
    voteUn: node.voteUn,
    flagUrl: node.flagUrl,
    isFlagged: node.isFlagged,
  }) as CommentActionState;

  store.set(node.id, state);
  return state;
}
