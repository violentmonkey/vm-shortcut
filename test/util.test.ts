import {
  reprKey,
  normalizeKey,
  parseCondition,
  reprShortcut,
} from '../src/util';

it('reprKey', () => {
  expect(reprKey('a', {})).toEqual('a');
  expect(reprKey('A', {}, true)).toEqual('A');
  expect(reprKey('f8', {}, true)).toEqual('f8');
  expect(reprKey('a', { c: true })).toEqual('c-a');
  expect(reprKey('A', { c: true }, true)).toEqual('c-A');
  expect(reprKey('a', { c: true, s: true })).toEqual('c-s-a');
});

it('normalizeKey', () => {
  expect(normalizeKey('i')).toEqual('i');
  expect(normalizeKey('c-i')).toEqual('c-i');
  expect(normalizeKey('c-I', true)).toEqual('c-I');
  expect(normalizeKey('ctrl-i')).toEqual('c-i');
  expect(normalizeKey('ctrl-shift-i')).toEqual('c-s-i');
  expect(normalizeKey('shift-ctrl-i')).toEqual('c-s-i');
  expect(normalizeKey('F8')).toEqual('f8');
  expect(normalizeKey('ctrl-F8')).toEqual('c-f8');
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
  expect(reprShortcut('ctrlcmd-c')).toEqual('^C');
});
