const isMacintosh = navigator.userAgent.includes('Macintosh');

export const modifierList = ['m', 'c', 's', 'a'] as const;

export const modifiers: Record<string, (typeof modifierList)[number]> = {
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

export const aliases: Record<string, string> = {
  arrowup: 'up',
  arrowdown: 'down',
  arrowleft: 'left',
  arrowright: 'right',
  cr: 'enter',
  escape: 'esc',
  ' ': 'space',
};
