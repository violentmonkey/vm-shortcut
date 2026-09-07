export const isMacintosh = navigator.userAgent.includes('Macintosh');

export const modifierList = ['m', 'c', 's', 'a'] as const;

export type IModifier = (typeof modifierList)[number];

export const modifiers: Record<string, IModifier> = {
  ctrl: 'c',
  control: 'c', // macOS
  shift: 's',
  alt: 'a',
  meta: 'm',
  cmd: 'm',
};

export const modifierAliases: Record<string, IModifier> = {
  ...modifiers,
  c: 'c',
  s: 's',
  a: 'a',
  m: 'm',
  cm: isMacintosh ? 'm' : 'c',
  ctrlcmd: isMacintosh ? 'm' : 'c',
};

export const modifierSymbols = {
  c: '^',
  s: '⇧',
  a: '⌥',
  m: '⌘',
};

export const aliases: Record<string, string> = {
  arrowup: 'up',
  arrowdown: 'down',
  arrowleft: 'left',
  arrowright: 'right',
  cr: 'enter',
  escape: 'esc',
  ' ': 'space',
};

/** Display symbols for keys known from `event.code`. */
export const codeSymbols: Record<string, string> = {
  backquote: '`',
  minus: '-',
  equal: '=',
  bracketleft: '[',
  bracketright: ']',
  backslash: '\\',
  semicolon: ';',
  quote: "'",
  comma: ',',
  period: '.',
  slash: '/',
};

/** Display symbols for suffixes of `Numpad*` keys in `event.code`. */
export const numpadSymbols: Record<string, string> = {
  enter: 'Enter',
  equal: '=',
  multiply: '*',
  add: '+',
  subtract: '-',
  decimal: '.',
  divide: '/',
  comma: ',',
};
