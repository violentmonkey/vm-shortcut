import { normalizeKey, normalizeShortcut } from '../src/util';

it('normalizeKey', () => {
  expect(normalizeKey('a')).toEqual('a');
  expect(normalizeKey('a', { c: true })).toEqual('c-a');
  expect(normalizeKey('a', { c: true, s: true })).toEqual('c-s-a');
  expect(normalizeKey('A')).toEqual('a');
  expect(normalizeKey('F8')).toEqual('f8');
});

it('normalizeShortcut', () => {
  expect(normalizeShortcut('i')).toEqual('i');
  expect(normalizeShortcut('c-i')).toEqual('c-i');
  expect(normalizeShortcut('ctrl-i')).toEqual('c-i');
  expect(normalizeShortcut('ctrl-shift-i')).toEqual('c-s-i');
  expect(normalizeShortcut('shift-ctrl-i')).toEqual('c-s-i');
  expect(normalizeShortcut('F8')).toEqual('f8');
  expect(normalizeShortcut('ctrl-F8')).toEqual('c-f8');
});
