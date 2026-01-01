import { expect, it } from 'vitest';
import { buildKey, parseCondition, parseKey, reprShortcut } from './util';

it('buildKey', () => {
  expect(
    buildKey({ base: 'a', modifierState: {}, caseSensitive: false }),
  ).toEqual('i:a');
  expect(
    buildKey({ base: 'A', modifierState: {}, caseSensitive: true }),
  ).toEqual('A');
  expect(
    buildKey({ base: 'f8', modifierState: {}, caseSensitive: true }),
  ).toEqual('f8');
  expect(
    buildKey({ base: 'a', modifierState: { c: true }, caseSensitive: false }),
  ).toEqual('i:c-a');
  expect(
    buildKey({ base: 'A', modifierState: { c: true }, caseSensitive: true }),
  ).toEqual('c-A');
  expect(
    buildKey({
      base: 'a',
      modifierState: { c: true, s: true },
      caseSensitive: false,
    }),
  ).toEqual('i:c-s-a');
});

it('parseKey', () => {
  expect(parseKey('i', false)).toEqual({
    base: 'i',
    modifierState: {},
    caseSensitive: false,
  });
  expect(parseKey('c-i', false)).toEqual({
    base: 'i',
    modifierState: { c: true },
    caseSensitive: false,
  });
  expect(parseKey('c-I', true)).toEqual({
    base: 'I',
    modifierState: { c: true },
    caseSensitive: true,
  });
  expect(parseKey('ctrl-i', false)).toEqual({
    base: 'i',
    modifierState: { c: true },
    caseSensitive: false,
  });
  expect(parseKey('ctrl-shift-i', false)).toEqual({
    base: 'i',
    modifierState: { c: true, s: true },
    caseSensitive: false,
  });
  expect(parseKey('shift-ctrl-i', false)).toEqual({
    base: 'i',
    modifierState: { c: true, s: true },
    caseSensitive: false,
  });
  expect(parseKey('F8', false)).toEqual({
    base: 'F8',
    modifierState: {},
    caseSensitive: false,
  });
  expect(parseKey('ctrl-F8', false)).toEqual({
    base: 'F8',
    modifierState: { c: true },
    caseSensitive: false,
  });
  expect(parseKey('-', false)).toEqual({
    base: '-',
    modifierState: {},
    caseSensitive: false,
  });
  expect(parseKey('c--', false)).toEqual({
    base: '-',
    modifierState: { c: true },
    caseSensitive: false,
  });
});

it('parseCondition', () => {
  expect(parseCondition('a && b')).toEqual([
    { field: 'a', not: false },
    { field: 'b', not: false },
  ]);
  expect(parseCondition('a && !b')).toEqual([
    { field: 'a', not: false },
    { field: 'b', not: true },
  ]);
});

it('reprShortcut', () => {
  expect(reprShortcut('c-s-a')).toEqual('^⇧A');
  expect(reprShortcut('c-s-a', true)).toEqual('^⇧A');
  expect(reprShortcut('c-s-enter')).toEqual('^⇧Enter');
  expect(reprShortcut('c-s-enter', true)).toEqual('^⇧Enter');
  expect(reprShortcut('ctrlcmd-c')).toEqual('^C');
  expect(reprShortcut('ctrlcmd-c', true)).toEqual('^c');
  expect(reprShortcut('c-a c-c')).toEqual('^A ^C');
  expect(reprShortcut('g')).toEqual('G');
  expect(reprShortcut('g', true)).toEqual('g');
  expect(reprShortcut('g g', true)).toEqual('g g');
  expect(reprShortcut('c--', false)).toEqual('^-');
});
