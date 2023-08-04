import {
  IShortcutCondition,
  IShortcutKey,
} from './types/shortcut';

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

export const modifierList = ['m', 'c', 's', 'a'] as const;

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

export function buildKey(key: IShortcutKey) {
  const { caseSensitive, modifierState } = key;
  let { base } = key;
  if (!caseSensitive || base.length > 1) base = base.toLowerCase();
  base = aliases[base] || base;
  return [...modifierList.filter((m) => modifierState[m]), base]
    .filter(Boolean)
    .join('-');
}

function breakKey(shortcut: string) {
  const pieces = shortcut.split(/-(.)/);
  const parts: string[] = [pieces[0]];
  for (let i = 1; i < pieces.length; i += 2) {
    parts.push(pieces[i] + pieces[i + 1]);
  }
  return parts;
}

export function parseKey(
  shortcut: string,
  caseSensitive: boolean
): IShortcutKey {
  const parts = breakKey(shortcut);
  const base = parts.pop();
  const modifierState = {};
  for (const part of parts) {
    const key = modifiers[part.toLowerCase()];
    if (!key) throw new Error(`Unknown modifier key: ${part}`);
    modifierState[key] = true;
  }
  return { base, modifierState, caseSensitive };
}

function getSequence(input: string | string[]) {
  return Array.isArray(input) ? input : input.split(/\s+/);
}

export function normalizeSequence(
  input: string | string[],
  caseSensitive: boolean
) {
  return getSequence(input).map((key) => parseKey(key, caseSensitive));
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

export function reprKey(key: IShortcutKey) {
  const { modifierState, caseSensitive } = key;
  let { base } = key;
  if (!caseSensitive || base.length > 1) {
    base = base[0].toUpperCase() + base.slice(1);
  }
  const modifiers = modifierList
    .filter((m) => modifierState[m])
    .map((m) => modifierSymbols[m]);
  return [...modifiers, base].join('');
}

export function reprShortcut(input: string | string[], caseSensitive = false) {
  return getSequence(input)
    .map((key) => parseKey(key, caseSensitive))
    .map((key) => reprKey(key))
    .join(' ');
}
