// Bound initial component creation across the whole tree, including replies.
export const INITIAL_COMMENT_RENDER_COUNT = 12;
// Include Vue's update in the budget; yield between batches for input and paint.
export const COMMENT_RENDER_BUDGET_MS = 8;
