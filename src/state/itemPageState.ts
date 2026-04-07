import { markRaw, reactive } from 'vue';
import type { CommentNode, ParsedItemPage } from '@/parsers/item';

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
