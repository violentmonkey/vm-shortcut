import {
  aliases,
  modifierAliases,
  modifierList,
  modifierSymbols,
} from './constants';
import { IShortcutCondition, IShortcutKey, IShortcutModifiers } from './types';

export function buildKey(key: IShortcutKey) {
  const { caseSensitive, modifierState } = key;
  let { base } = key;
  if (!caseSensitive || base.length > 1) base = base.toLowerCase();
  base = aliases[base] || base;
  const keyExp = [...modifierList.filter((m) => modifierState[m]), base]
    .filter(Boolean)
    .join('-');
  return `${caseSensitive ? '' : 'i:'}${keyExp}`;
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
  caseSensitive: boolean,
): IShortcutKey {
  const parts = breakKey(shortcut);
  const base = parts.pop() as string;
  const modifierState: IShortcutModifiers = {};
  for (const part of parts) {
    const key = modifierAliases[part.toLowerCase()];
    if (!key) throw new Error(`Unknown modifier key: ${part}`);
    modifierState[key] = true;
  }
  // Alt/Shift modifies the character.
  // In case sensitive mode, we only need to check the modified character: <c-A> = Ctrl+Shift+KeyA
  // In case insensitive mode, we check the keyCode as well as modifiers: <c-s-a> = Ctrl+Shift+KeyA
  // So if Alt/Shift appears in the shortcut, we must switch to case insensitive mode.
  caseSensitive &&= !(modifierState.a || modifierState.s);
  return { base, modifierState, caseSensitive };
}

function getSequence(input: string | string[]) {
  return Array.isArray(input) ? input : input.split(/\s+/);
}

export function normalizeSequence(
  input: string | string[],
  caseSensitive: boolean,
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
    .filter(Boolean) as IShortcutCondition[];
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
