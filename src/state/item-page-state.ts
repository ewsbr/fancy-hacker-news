import type { CommentNode, DeferredCommentThread, ParsedItemPage } from '@/parsers/item';
import { markRaw, reactive } from 'vue';
import { parseCommentThreadRows } from '@/parsers/item';
import { assert } from '@/utils/assert';

function markCommentTreeRaw(nodes: CommentNode[]): CommentNode[] {
  for (const node of nodes) {
    markCommentTreeRaw(node.children);
    markRaw(node.children);
    markRaw(node.navLinks);
    if (node.lazyThread) {
      markRaw(node.lazyThread);
    }
    markRaw(node);
  }

  return markRaw(nodes);
}

/** Call only after successful takeover; a shared parent would retain other threads. */
export function detachDeferredCommentRows(pageData: ParsedItemPage) {
  for (const node of pageData.comments) {
    const state = node.lazyThread?.state;
    if (state?.kind === 'pending') {
      for (const row of state.rows) {
        assert(!row.isConnected, `Cannot detach comment ${row.id} before source cleanup`);
        row.remove();
      }
    }
  }
}

/** Consume rows only on success. Cache the raw model across component remounts. */
export function loadDeferredCommentThread(thread: DeferredCommentThread): CommentNode {
  if (thread.state.kind === 'loaded') {
    return thread.state.root;
  }

  const roots = parseCommentThreadRows(thread.state.rows);
  assert(roots.length === 1, `Expected one root for deferred thread ${thread.state.rows[0]?.id ?? '(missing)'}, got ${roots.length}`);
  markCommentTreeRaw(roots);
  const root = roots[0];
  thread.state = { kind: 'loaded', root };
  return root;
}

export function makeItemPageReactive(pageData: ParsedItemPage): ParsedItemPage {
  markCommentTreeRaw(pageData.comments);

  return reactive({
    ...pageData,
    comments: pageData.comments,
  }) as ParsedItemPage;
}
