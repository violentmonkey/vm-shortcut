import {
  IKeyNode,
  IShortcut,
  IShortcutCondition,
  IShortcutConditionCache,
  IShortcutOptions,
  IShortcutServiceOptions,
} from './types';
import {
  normalizeSequence,
  parseCondition,
  getOriginalKey,
  buildKey,
} from './util';
import { addKeyNode, createKeyNode, getKeyNode, removeKeyNode } from './node';
import { modifiers } from './constants';
import { Subject } from './subject';

export * from './constants';
export * from './types';
export * from './util';

export class KeyboardService {
  private _context: Record<string, unknown> = {};

  private _conditionData: { [key: string]: IShortcutConditionCache } = {};

  private _data: IShortcut[] = [];

  private _root = createKeyNode();

  private _cur: IKeyNode | undefined;

  sequence = new Subject<string[]>([]);

  private _timer = 0;

  static defaultOptions: IShortcutServiceOptions = {
    sequenceTimeout: 500,
  };

  options: IShortcutServiceOptions;

  constructor(options?: Partial<IShortcutServiceOptions>) {
    this.options = {
      ...KeyboardService.defaultOptions,
      ...options,
    };
  }

  private _reset = () => {
    this._cur = undefined;
    this.sequence.set([]);
    this._resetTimer();
  };

  private _resetTimer() {
    if (this._timer) {
      window.clearTimeout(this._timer);
      this._timer = 0;
    }
  }

  private _addCondition(condition: string) {
    let cache = this._conditionData[condition];
    if (!cache) {
      const value = parseCondition(condition);
      cache = {
        count: 0,
        value,
        result: this._evalCondition(value),
      };
      this._conditionData[condition] = cache;
    }
    cache.count += 1;
  }

  private _removeCondition(condition: string) {
    const cache = this._conditionData[condition];
    if (cache) {
      cache.count -= 1;
      if (!cache.count) {
        delete this._conditionData[condition];
      }
    }
  }

  private _evalCondition(conditions: IShortcutCondition[]) {
    return conditions.every((cond) => {
      let value = this._context[cond.field];
      if (cond.not) value = !value;
      return value;
    });
  }

  private _checkShortcut(item: IShortcut) {
    const cache = item.condition && this._conditionData[item.condition];
    const enabled = !cache || cache.result;
    if (item.enabled !== enabled) {
      item.enabled = enabled;
      this._enableShortcut(item);
    }
  }

  private _enableShortcut(item: IShortcut) {
    (item.enabled ? addKeyNode : removeKeyNode)(
      this._root,
      item.sequence,
      item,
    );
  }

  enable() {
    this.disable();
    document.addEventListener('keydown', this.handleKey);
  }

  disable() {
    document.removeEventListener('keydown', this.handleKey);
  }

  register(
    key: string,
    callback: () => void,
    options?: Partial<IShortcutOptions>,
  ) {
    const { caseSensitive, condition }: IShortcutOptions = {
      caseSensitive: false,
      ...options,
    };
    const sequence = normalizeSequence(key, caseSensitive).map((key) =>
      buildKey(key),
    );
    const item: IShortcut = {
      sequence,
      condition,
      callback,
      enabled: false,
      caseSensitive,
    };
    if (condition) this._addCondition(condition);
    this._checkShortcut(item);
    this._data.push(item);
    return () => {
      const index = this._data.indexOf(item);
      if (index >= 0) {
        this._data.splice(index, 1);
        if (condition) this._removeCondition(condition);
        item.enabled = false;
        this._enableShortcut(item);
      }
    };
  }

  setContext(key: string, value: unknown) {
    this._context[key] = value;
    for (const cache of Object.values(this._conditionData)) {
      cache.result = this._evalCondition(cache.value);
    }
    for (const item of this._data) {
      this._checkShortcut(item);
    }
  }

  handleKeyOnce(keyExps: string[], fromRoot: boolean): boolean {
    let cur: IKeyNode | undefined = this._cur;
    if (fromRoot || !cur) {
      // set fromRoot to true to avoid another retry
      fromRoot = true;
      cur = this._root;
    }
    if (cur) {
      let next: IKeyNode | undefined;
      for (const key of keyExps) {
        next = getKeyNode(cur, [key]);
        if (next) {
          this.sequence.set([...this.sequence.get(), key]);
          break;
        }
      }
      cur = next;
    }
    this._cur = cur;
    const [shortcut] = [...(cur?.shortcuts || [])];
    if (!fromRoot && !shortcut && !cur?.children.size) {
      // Nothing is matched with the last key, rematch from root
      this._reset();
      return this.handleKeyOnce(keyExps, true);
    }
    if (shortcut) {
      try {
        shortcut.callback();
      } catch {
        // ignore
      }
      return true;
    }
    return false;
  }

  handleKey = (e: KeyboardEvent) => {
    // Chrome sends a trusted keydown event with no key when choosing from autofill
    if (!e.key || modifiers[e.key.toLowerCase()]) return;
    this._resetTimer();
    const keyExps = [
      // case sensitive mode, `e.key` is the character considering Alt/Shift
      buildKey({
        base: e.key,
        modifierState: {
          c: e.ctrlKey,
          m: e.metaKey,
        },
        caseSensitive: true,
      }),
      // case insensitive mode, using `e.code` with modifiers including Alt/Shift
      buildKey({
        base: e.code,
        modifierState: {
          c: e.ctrlKey,
          s: e.shiftKey,
          a: e.altKey,
          m: e.metaKey,
        },
        caseSensitive: false,
      }),
      // case insensitive mode, using `e.code` for keys that can be modified by `Alt/Shift`, otherwise `e.key`
      buildKey({
        base: getOriginalKey(e),
        modifierState: {
          c: e.ctrlKey,
          s: e.shiftKey,
          a: e.altKey,
          m: e.metaKey,
        },
        caseSensitive: false,
      }),
    ];
    if (this.handleKeyOnce(keyExps, false)) {
      e.preventDefault();
      this._reset();
    }
    this._timer = window.setTimeout(this._reset, this.options.sequenceTimeout);
  };
}

let service: KeyboardService;

export function getService() {
  if (!service) {
    service = new KeyboardService();
    service.enable();
  }
  return service;
}

export const register = (...args: Parameters<KeyboardService['register']>) =>
  getService().register(...args);
export const enable = () => getService().enable();
export const disable = () => getService().disable();
export const handleKey = (...args: Parameters<KeyboardService['handleKey']>) =>
  getService().handleKey(...args);
