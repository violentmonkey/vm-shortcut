import test from 'tape';
import { normalizeKey, normalizeShortcut } from '#/util';

test('normalizeKey', t => {
  t.equal(normalizeKey('a'), 'a');
  t.equal(normalizeKey('a', { c: true }), 'c-a');
  t.equal(normalizeKey('a', { c: true, s: true }), 'c-s-a');
  t.equal(normalizeKey('A'), 'a');
  t.equal(normalizeKey('F8'), 'f8');
  t.end();
});

test('normalizeShortcut', t => {
  t.equal(normalizeShortcut('i'), 'i');
  t.equal(normalizeShortcut('c-i'), 'c-i');
  t.equal(normalizeShortcut('ctrl-i'), 'c-i');
  t.equal(normalizeShortcut('ctrl-shift-i'), 'c-s-i');
  t.equal(normalizeShortcut('shift-ctrl-i'), 'c-s-i');
  t.equal(normalizeShortcut('F8'), 'f8');
  t.equal(normalizeShortcut('ctrl-F8'), 'c-f8');
  t.end();
});
