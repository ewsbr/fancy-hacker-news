// Bound initial component creation across the whole tree, including replies.
export const INITIAL_COMMENT_RENDER_COUNT = 12;
// Include Vue's update in the budget; yield between batches for input and paint.
export const COMMENT_RENDER_BUDGET_MS = 8;

export const COMMENT_COLLAPSED_GRAY_LEVELS = new Set(['cce', 'cdd']);
export const COMMENT_ROOT_GAP_PX = 4;
export const COMMENT_REPLY_GAP_PX = 12;

// Approximate CommentNode/RichText geometry; these are estimates, not fixed row sizes.
export const COMMENT_HEIGHT_ESTIMATE = {
  headerPx: 32,
  actionsPx: 28,
  threadControlPx: 40,
  threadOffsetPx: 7,
  replyIndentPx: 20,
  paragraphGapPx: 10,
  lineHeightEm: 1.6,
  characterWidthEm: 0.5,
  minTextWidthPx: 80,
  contentMaxWidthPx: 1024,
  modalMaxWidthPx: 680,
  contentInsetPx: 40,
} as const;
