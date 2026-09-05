import type { CommentNode } from '@/parsers/item';
import { COMMENT_REPLY_GAP_PX, COMMENT_HEIGHT_ESTIMATE as SIZE } from '@/constants/comment-rendering';
import { getCommentThreadUiEligibility } from '@/content/composables/comment-node';
import { isCommentInitiallyCollapsed } from '@/state/comment-collapse';
import { getHtmlTextBlocks } from '@/utils/html-text';

// Parsed comment bodies are immutable. Retain text metrics across widths,
// fragment navigations, and modal surfaces without retaining discarded nodes.
const textBlocks = new WeakMap<CommentNode, ReturnType<typeof getHtmlTextBlocks>>();

function getCommentTextBlocks(node: CommentNode) {
  let blocks = textBlocks.get(node);
  if (!blocks) {
    blocks = getHtmlTextBlocks(node.bodyHtml);
    textBlocks.set(node, blocks);
  }
  return blocks;
}

interface CommentHeightContext {
  width: number;
  fontSize: number;
  isMobileLayout: boolean;
  inModal: boolean;
  enableMobileSubthreads: boolean;
  hashPathIds: ReadonlySet<string>;
  hashTargetId: string | null;
}

/**
 * Cache subtree estimates for one surface and width/navigation.
 * Each node must have one depth within this surface; modals use separate estimators.
 */
export function createCommentHeightEstimator(context: CommentHeightContext) {
  const heights = new WeakMap<CommentNode, number>();

  function estimate(node: CommentNode, depth = 0): number {
    if (node.lazyThread?.state.kind === 'loaded') return estimate(node.lazyThread.state.root, depth);
    const cached = heights.get(node);
    if (cached !== undefined) return cached;

    const forceExpanded = (node.expandForHash || context.hashPathIds.has(node.id)) && node.id !== context.hashTargetId;
    const collapsed = isCommentInitiallyCollapsed(node) && !forceExpanded;
    let height = SIZE.headerPx;
    if (!collapsed) {
      const width = Math.max(SIZE.minTextWidthPx, context.width - depth * SIZE.replyIndentPx);
      const charactersPerLine = width / (context.fontSize * SIZE.characterWidthEm);
      const blocks = node.placeholderKind ? [] : getCommentTextBlocks(node);
      // Preformatted lines scroll horizontally instead of wrapping.
      const lines = blocks.reduce((sum, block) => sum + block.lineLengths.reduce(
        (total, length) => total + (block.preformatted ? 1 : Math.max(1, Math.ceil(length / charactersPerLine))),
        0,
      ), 0);
      height += Math.max(1, lines) * context.fontSize * SIZE.lineHeightEm
        + Math.max(0, blocks.length - 1) * SIZE.paragraphGapPx + SIZE.actionsPx;

      const { usesMobileSubthreadModal } = getCommentThreadUiEligibility({
        ...context,
        depth,
        childCount: node.children.length,
      });
      if (usesMobileSubthreadModal) {
        height += SIZE.threadControlPx;
      } else if (node.children.length) {
        height += SIZE.threadOffsetPx
          + node.children.reduce((sum, child) => sum + estimate(child, depth + 1), 0)
          + (node.children.length - 1) * COMMENT_REPLY_GAP_PX;
      }
    }
    // Deferred roots reserve only their shell and explicit control, never unopened replies.
    if (node.lazyThread) height += SIZE.threadControlPx;
    heights.set(node, Math.ceil(height));
    return Math.ceil(height);
  }

  return estimate;
}
