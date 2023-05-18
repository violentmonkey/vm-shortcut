import {
  IShortcut,
  IShortcutCondition,
  IShortcutConditionCache,
  IShortcutOptions,
  IShortcutServiceOptions,
} from './types/shortcut';
import { modifiers, normalizeSequence, parseCondition, buildKey } from './util';
import { KeyNode } from './node';

export * from './util';
export * from './types/shortcut';

export class KeyboardService {
  private _context: Record<string, unknown> = {};

  private _conditionData: { [key: string]: IShortcutConditionCache } = {};

  private _dataCI: IShortcut[] = [];

  private _dataCS: IShortcut[] = [];

  private _rootCI = new KeyNode();

  private _rootCS = new KeyNode();

  private _curCI: KeyNode;

  private _curCS: KeyNode;

  private _timer: NodeJS.Timeout;

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
    this._curCI = null;
    this._curCS = null;
    this._resetTimer();
  };

  private _resetTimer() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
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
    const root = item.caseSensitive ? this._rootCS : this._rootCI;
    if (item.enabled) {
      root.add(item.sequence, item);
    } else {
      root.remove(item.sequence, item);
    }
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
    options?: Partial<IShortcutOptions>
  ) {
    const { caseSensitive, condition }: IShortcutOptions = {
      caseSensitive: false,
      ...options,
    };
    const sequence = normalizeSequence(key, caseSensitive);
    const data = caseSensitive ? this._dataCS : this._dataCI;
    const item: IShortcut = {
      sequence,
      condition,
      callback,
      enabled: false,
      caseSensitive,
    };
    if (condition) this._addCondition(condition);
    this._checkShortcut(item);
    data.push(item);
    return () => {
      const index = data.indexOf(item);
      if (index >= 0) {
        data.splice(index, 1);
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
    for (const data of [this._dataCS, this._dataCI]) {
      for (const item of data) {
        this._checkShortcut(item);
      }
    }
  }

  handleKeyOnce(keyCS: string, keyCI: string, fromRoot: boolean) {
    let curCS = this._curCS;
    let curCI = this._curCI;
    if (fromRoot || (!curCS && !curCI)) {
      // set fromRoot to true to avoid another retry
      fromRoot = true;
      curCS = this._rootCS;
      curCI = this._rootCI;
    }
    if (curCS) curCS = curCS.get([keyCS]);
    if (curCI) curCI = curCI.get([keyCI]);
    const shortcuts = [
      ...(curCI ? curCI.shortcuts : []),
      ...(curCS ? curCS.shortcuts : []),
    ].reverse();
    this._curCS = curCS;
    this._curCI = curCI;
    if (
      !fromRoot &&
      !shortcuts.length &&
      !curCS?.children.size &&
      !curCI?.children.size
    ) {
      // Nothing is matched with the last key, rematch from root
      return this.handleKeyOnce(keyCS, keyCI, true);
    }
    for (const shortcut of shortcuts) {
      try {
        shortcut.callback();
      } catch {
        // ignore
      }
      return true;
    }
  }

  handleKey = (e: KeyboardEvent) => {
    // Chrome sends a trusted keydown event with no key when choosing from autofill
    if (!e.key || (e.key.length > 1 && modifiers[e.key.toLowerCase()])) return;
    this._resetTimer();
    const keyCS = buildKey(
      e.key,
      {
        c: e.ctrlKey,
        a: e.altKey,
        m: e.metaKey,
      },
      true
    );
    const keyCI = buildKey(e.key, {
      c: e.ctrlKey,
      s: e.shiftKey,
      a: e.altKey,
      m: e.metaKey,
    });
    if (this.handleKeyOnce(keyCS, keyCI, false)) {
      e.preventDefault();
      this._reset();
    }
    this._timer = setTimeout(this._reset, this.options.sequenceTimeout);
  };
}

let service: KeyboardService;

function getService() {
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

if (process.env.VM && typeof VM !== 'undefined') {
  VM.registerShortcut = (key: string, callback: () => void) => {
    console.warn(
      '[vm-shortcut] VM.registerShortcut is deprecated in favor of VM.shortcut.register, and will be removed in 2.x'
    );
    register(key, callback);
  };
}
