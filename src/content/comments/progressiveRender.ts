import type { CommentNode } from '@/parsers/item';

export const ROOT_PROGRESSIVE_RENDER_THRESHOLD = 300;
export const ROOT_INITIAL_RENDER_BUDGET = 180;
export const ROOT_FRAME_RENDER_BUDGET = 320;

export const CHILD_PROGRESSIVE_RENDER_THRESHOLD = 160;
export const CHILD_INITIAL_RENDER_BUDGET = 120;
export const CHILD_FRAME_RENDER_BUDGET = 240;

export function shouldProgressivelyRenderRoots(totalCommentCount: number): boolean {
  return totalCommentCount > ROOT_PROGRESSIVE_RENDER_THRESHOLD;
}

export function shouldProgressivelyRenderChildren(
  descendantCount: number,
  inModal: boolean | undefined,
): boolean {
  return !inModal && descendantCount > CHILD_PROGRESSIVE_RENDER_THRESHOLD;
}

export function nextVisibleNodeCount(
  nodes: Array<Pick<CommentNode, 'descendantCount'>>,
  startIndex: number,
  budget: number,
): number {
  let spent = 0;
  let nextIndex = startIndex;

  while (nextIndex < nodes.length) {
    const node = nodes[nextIndex];
    const cost = node.descendantCount + 1;

    if (nextIndex > startIndex && spent + cost > budget) {
      break;
    }

    spent += cost;
    nextIndex += 1;

    if (spent >= budget) {
      break;
    }
  }

  return nextIndex;
}

export function requiredVisibleNodeCount(
  nodes: Array<Pick<CommentNode, 'id' | 'expandForHash'>>,
  hashPathIds: ReadonlySet<string>,
): number {
  let requiredCount = 0;

  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (node.expandForHash || hashPathIds.has(node.id)) {
      requiredCount = index + 1;
    }
  }

  return requiredCount;
}
