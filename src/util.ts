import { IShortcutModifiers, IShortcutCondition } from './types/shortcut';

const isMacintosh = navigator.userAgent.includes('Macintosh');

export const modifiers = {
  c: 'c',
  s: 's',
  a: 'a',
  m: 'm',
  ctrl: 'c',
  control: 'c', // macOS
  shift: 's',
  alt: 'a',
  meta: 'm',
  cmd: 'm',
  ctrlcmd: isMacintosh ? 'm' : 'c',
};

export const modifierSymbols = {
  c: '^',
  s: '⇧',
  a: '⌥',
  m: '⌘',
};

export const aliases = {
  arrowup: 'up',
  arrowdown: 'down',
  arrowleft: 'left',
  arrowright: 'right',
  cr: 'enter',
  escape: 'esc',
  ' ': 'space',
};

export function buildKey(
  base: string,
  mod: IShortcutModifiers,
  caseSensitive = false
) {
  const { c, s, a, m } = mod;
  if (!caseSensitive || base.length > 1) base = base.toLowerCase();
  base = aliases[base] || base;
  return [m && 'm', c && 'c', s && 's', a && 'a', base]
    .filter(Boolean)
    .join('-');
}

export function normalizeKey(shortcut: string, caseSensitive: boolean) {
  const parts = shortcut.split('-');
  const base = parts.pop();
  const modifierState = {};
  for (const part of parts) {
    const key = modifiers[part.toLowerCase()];
    if (!key) throw new Error(`Unknown modifier key: ${part}`);
    modifierState[key] = true;
  }
  return buildKey(base, modifierState, caseSensitive);
}

function getSequence(input: string | string[]) {
  return Array.isArray(input) ? input : input.split(/\s+/);
}

export function normalizeSequence(input: string | string[], caseSensitive: boolean) {
  return getSequence(input).map((key) => normalizeKey(key, caseSensitive));
}

export function parseCondition(condition: string): IShortcutCondition[] {
  return condition
    .split('&&')
    .map((key) => {
      key = key.trim();
      if (!key) return;
      if (key[0] === '!') {
        return { not: true, field: key.slice(1).trim() };
      }
      return { not: false, field: key };
    })
    .filter(Boolean);
}

export function reprKey(key: string, caseSensitive: boolean) {
  const parts = normalizeKey(key, caseSensitive).split('-');
  let base = parts.pop();
  if (!caseSensitive || base.length > 1) {
    base = base[0].toUpperCase() + base.slice(1);
  }
  const modifiers = parts.map((p) => modifierSymbols[p]).filter(Boolean);
  return [...modifiers, base].join('');
}

export function reprShortcut(input: string | string[], caseSensitive = false) {
  return getSequence(input).map(key => reprKey(key, caseSensitive)).join(' ');
}