export const modifiers = {
  ctrl: 'c',
  control: 'c', // mac OS
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
    base.toLowerCase(),
  ].filter(Boolean).join('-');
}

export function normalizeShortcut(shortcut) {
  const parts = shortcut.toLowerCase().split('-');
  const base = parts.pop();
  const modifierState = parts.reduce((map, c) => {
    const key = modifiers[c] || c;
    map[key] = true;
    return map;
  }, {});
  return normalizeKey(base, modifierState);
}
