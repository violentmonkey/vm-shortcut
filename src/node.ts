import { IShortcut } from './types/shortcut';

export class KeyNode {
  children = new Map<string, KeyNode>();

  shortcuts = new Set<IShortcut>();

  add(sequence: string[], shortcut: IShortcut) {
    let node: KeyNode = this;
    for (const key of sequence) {
      let child = node.children.get(key);
      if (!child) {
        child = new KeyNode();
        node.children.set(key, child);
      }
      node = child;
    }
    node.shortcuts.add(shortcut);
  }

  get(sequence: string[]): KeyNode {
    let node: KeyNode = this;
    for (const key of sequence) {
      node = node.children.get(key);
      if (!node) return null;
    }
    return node;
  }

  remove(sequence: string[], shortcut?: IShortcut) {
    let node: KeyNode = this;
    const ancestors = [node];
    for (const key of sequence) {
      node = node.children.get(key);
      if (!node) return;
      ancestors.push(node);
    }
    if (shortcut) node.shortcuts.delete(shortcut);
    else node.shortcuts.clear();
    let i = ancestors.length - 1;
    while (i > 1) {
      node = ancestors[i];
      if (node.shortcuts.size || node.children.size) break;
      const last = ancestors[i - 1];
      last.children.delete(sequence[i - 1]);
      i -= 1;
    }
  }
}
