export interface ThreadTreeNode<T> {
  indent: number;
  isCollapsed: boolean;
  children: T[];
}

export interface DescendantAnnotatedNode<T> {
  descendantCount: number;
  children: T[];
}

export interface CommentTreeMetrics<T> {
  comments: T[];
  maxDepth: number;
  collapsedRows: number;
}

export function buildIndentedCommentTree<T extends ThreadTreeNode<T>>(
  rows: Element[],
  parseRow: (row: Element) => T,
): CommentTreeMetrics<T> {
  const comments: T[] = [];
  const stack: { depth: number; children: T[] }[] = [{ depth: -1, children: comments }];
  let maxDepth = 0;
  let collapsedRows = 0;

  for (const row of rows) {
    const node = parseRow(row);
    maxDepth = Math.max(maxDepth, node.indent);
    if (node.isCollapsed) {
      collapsedRows += 1;
    }

    while (stack.length > 1 && stack[stack.length - 1].depth >= node.indent) {
      stack.pop();
    }

    stack[stack.length - 1].children.push(node);
    stack.push({ depth: node.indent, children: node.children });
  }

  return {
    comments,
    maxDepth,
    collapsedRows,
  };
}

function countDescendants<T extends DescendantAnnotatedNode<T>>(node: T): number {
  let total = 0;

  for (const child of node.children) {
    total += 1 + countDescendants(child);
  }

  node.descendantCount = total;
  return total;
}

export function annotateDescendantCounts<T extends DescendantAnnotatedNode<T>>(nodes: T[]): T[] {
  for (const node of nodes) {
    countDescendants(node);
  }

  return nodes;
}
