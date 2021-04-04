import { KeyNode } from '../src/node';

function toJSON(node: KeyNode) {
  return [
    node.shortcuts.size,
    Array.from(
      node.children.entries(),
      ([key, child]) => [key, toJSON(child)],
    ),
  ];
}

function createShortcut() {
  return { callback: () => {} };
}

describe('KeyNode', () => {
  test('add', () => {
    const tree = new KeyNode();
    tree.add(['a'], createShortcut());
    tree.add(['a', 'b'], createShortcut());
    tree.add(['a', 'c', 'd'], createShortcut());
    tree.add(['a', 'c', 'd'], createShortcut());
    expect(toJSON(tree)).toEqual([
      0,
      [
        [
          'a',
          [
            1,
            [
              [
                'b',
                [
                  1,
                  [],
                ],
              ],
              [
                'c',
                [
                  0,
                  [
                    [
                      'd',
                      [
                        2,
                        [],
                      ],
                    ],
                  ],
                ],
              ],
            ],
          ],
        ],
      ],
    ]);
  });

  test('remove', () => {
    const tree = new KeyNode();
    tree.add(['a'], createShortcut());
    tree.add(['a', 'b'], createShortcut());
    tree.add(['a', 'c', 'd'], createShortcut());
    tree.remove(['a', 'c', 'd']);
    expect(toJSON(tree)).toEqual([
      0,
      [
        [
          'a',
          [
            1,
            [
              [
                'b',
                [
                  1,
                  [],
                ],
              ],
            ],
          ],
        ],
      ],
    ]);
  });
});
