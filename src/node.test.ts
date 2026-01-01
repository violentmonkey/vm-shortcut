import { describe, expect, test } from 'vitest';
import { addKeyNode, createKeyNode, removeKeyNode } from './node';
import { IKeyNode } from './types';

type ISerializedNode = [number, Array<[string, ISerializedNode]>];

function toJSON(node: IKeyNode): ISerializedNode {
  return [
    node.shortcuts.size,
    Array.from(node.children.entries(), ([key, child]) => [key, toJSON(child)]),
  ];
}

function createShortcut() {
  return {
    sequence: [],
    callback: () => {
      /* dummy */
    },
    enabled: true,
    caseSensitive: true,
  };
}

describe('KeyNode', () => {
  test('add', () => {
    const tree = createKeyNode();
    addKeyNode(tree, ['a'], createShortcut());
    addKeyNode(tree, ['a', 'b'], createShortcut());
    addKeyNode(tree, ['a', 'c', 'd'], createShortcut());
    addKeyNode(tree, ['a', 'c', 'd'], createShortcut());
    expect(toJSON(tree)).toEqual([
      0,
      [
        [
          'a',
          [
            1,
            [
              ['b', [1, []]],
              ['c', [0, [['d', [2, []]]]]],
            ],
          ],
        ],
      ],
    ]);
  });

  test('remove', () => {
    const tree = createKeyNode();
    addKeyNode(tree, ['a'], createShortcut());
    addKeyNode(tree, ['a', 'b'], createShortcut());
    addKeyNode(tree, ['a', 'c', 'd'], createShortcut());
    removeKeyNode(tree, ['a', 'c', 'd']);
    expect(toJSON(tree)).toEqual([0, [['a', [1, [['b', [1, []]]]]]]]);
  });
});
