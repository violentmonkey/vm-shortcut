export interface IShortcutModifiers {
  c?: boolean;
  s?: boolean;
  a?: boolean;
  m?: boolean;
}

export interface IShortcutCondition {
  field: string;
  not: boolean;
}

export interface IShortcut {
  sequence: string[];
  condition?: string;
  callback: () => void;
  enabled: boolean;
  caseSensitive: boolean;
}

export interface IShortcutConditionCache {
  count: number;
  value: IShortcutCondition[];
  result: boolean;
}

export interface IShortcutOptions {
  condition?: string;
  caseSensitive: boolean;
}

export interface IShortcutServiceOptions {
  /** Max timeout between two keys within a sequence. */
  sequenceTimeout: number;
}

export interface IShortcutKey {
  base: string;
  modifierState: IShortcutModifiers;
  caseSensitive: boolean;
}
