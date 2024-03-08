import { IKeyNode, IShortcut } from './types';

export function createKeyNode(): IKeyNode {
  return {
    children: new Map(),
    shortcuts: new Set(),
  };
}

export function addKeyNode(
  parent: IKeyNode,
  sequence: string[],
  shortcut: IShortcut,
) {
  let node: IKeyNode = parent;
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

export function getKeyNode(parent: IKeyNode, sequence: string[]) {
  let node: IKeyNode | undefined = parent;
  for (const key of sequence) {
    node = node.children.get(key);
    if (!node) break;
  }
  return node;
}

export function removeKeyNode(
  parent: IKeyNode,
  sequence: string[],
  shortcut?: IShortcut,
) {
  let node: IKeyNode | undefined = parent;
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
