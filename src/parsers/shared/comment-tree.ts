interface CommentTreeNode<T> {
  indent: number;
  descendantCount: number;
  children: T[];
}

function countDescendants<T extends CommentTreeNode<T>>(node: T): number {
  node.descendantCount = node.children.reduce((total, child) => total + 1 + countDescendants(child), 0);
  return node.descendantCount;
}

/** Nest flat HN rows by indent and annotate each node's descendant count. */
export function buildCommentTree<T extends CommentTreeNode<T>>(
  rows: Iterable<Element>,
  parseRow: (row: Element) => T,
): T[] {
  const roots: T[] = [];
  const stack: { depth: number; children: T[] }[] = [{ depth: -1, children: roots }];

  for (const row of rows) {
    const node = parseRow(row);
    while (stack.length > 1 && stack[stack.length - 1].depth >= node.indent) {
      stack.pop();
    }

    stack[stack.length - 1].children.push(node);
    stack.push({ depth: node.indent, children: node.children });
  }

  roots.forEach(countDescendants);
  return roots;
}
