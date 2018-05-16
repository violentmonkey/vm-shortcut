export const modifiers = {
  ctrl: 'c',
  shift: 's',
  alt: 'a',
  meta: 'm',
};

export function normalizeKey(base, {
  c, s, a, m,
} = {}) {
  return [
    c && 'c',
    s && 's',
    a && 'a',
    m && 'm',
    base,
  ].filter(Boolean).join('-');
}

export function normalizeShortcut(shortcut) {
  const parts = shortcut.toLowerCase().split('-');
  const base = parts.pop();
  const modifierState = parts.reduce((map, c) => {
    c = modifiers[c] || c;
    map[c] = true;
    return map;
  }, {});
  return normalizeKey(base, modifierState);
}
