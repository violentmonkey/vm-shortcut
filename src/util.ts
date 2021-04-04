export const modifiers = {
  ctrl: 'c',
  control: 'c', // macOS
  shift: 's',
  alt: 'a',
  meta: 'm',
};

export interface IModifiers {
  c?: boolean;
  s?: boolean;
  a?: boolean;
  m?: boolean;
}

export function normalizeKey(base: string, mod: IModifiers = {}) {
  const {
    c, s, a, m,
  } = mod;
  return [
    m && 'm',
    c && 'c',
    s && 's',
    a && 'a',
    base.toLowerCase(),
  ].filter(Boolean).join('-');
}

export function normalizeShortcut(shortcut: string) {
  const parts = shortcut.toLowerCase().split('-');
  const base = parts.pop();
  const modifierState = parts.reduce((map, c) => {
    const key = modifiers[c] || c;
    map[key] = true;
    return map;
  }, {});
  return normalizeKey(base, modifierState);
}
