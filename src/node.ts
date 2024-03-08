import { IKeyNode, IShortcut } from './types';

export function createKeyNode(): IKeyNode {
  return {
    children: new Map(),
    shortcuts: new Set(),
  };
}

export function addKeyNode(
  root: IKeyNode,
  sequence: string[],
  shortcut: IShortcut,
) {
  let node: IKeyNode = root;
  for (const key of sequence) {
    let child = node.children.get(key);
    if (!child) {
      child = createKeyNode();
      node.children.set(key, child);
    }
    node = child;
  }
  node.shortcuts.add(shortcut);
}

export function getKeyNode(root: IKeyNode, sequence: string[]) {
  let node: IKeyNode | undefined = root;
  for (const key of sequence) {
    node = node.children.get(key);
    if (!node) break;
  }
  return node;
}

export function removeKeyNode(
  root: IKeyNode,
  sequence: string[],
  shortcut?: IShortcut,
) {
  let node: IKeyNode | undefined = root;
  const ancestors = [node];
  for (const key of sequence) {
    node = node.children.get(key);
    if (!node) return;
    ancestors.push(node);
  }
  if (shortcut) node.shortcuts.delete(shortcut);
  else node.shortcuts.clear();
  let i = ancestors.length - 1;
  while (i > 0) {
    node = ancestors[i];
    if (node.shortcuts.size || node.children.size) break;
    const last = ancestors[i - 1];
    last.children.delete(sequence[i - 1]);
    i -= 1;
  }
}

export function reprNodeTree(root: IKeyNode) {
  const result: string[] = [];
  const reprChildren = (node: IKeyNode, level = 0) => {
    for (const [key, child] of node.children.entries()) {
      result.push(
        [
          '  '.repeat(level),
          key,
          child.shortcuts.size ? ` (${child.shortcuts.size})` : '',
        ].join(''),
      );
      reprChildren(child, level + 1);
    }
  };
  reprChildren(root);
  return result.join('\n');
}
