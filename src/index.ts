import {
  modifiers, reprKey, normalizeSequence, IShortcut,
} from './util';
import { KeyNode } from './node';

export * from './util';

export class KeyboardService {
  private _context: { [key: string]: any } = {};

  private _rootCI = new KeyNode();

  private _rootCS = new KeyNode();

  private _curCI: KeyNode;

  private _curCS: KeyNode;

  private _timer: NodeJS.Timeout;

  options = {
    sequenceTimeout: 500,
  };

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

  enable() {
    this.disable();
    document.addEventListener('keydown', this.handleKey);
  }

  disable() {
    document.removeEventListener('keydown', this.handleKey);
  }

  register(key: string, shortcut: IShortcut, caseSensitive = false) {
    const sequence = normalizeSequence(key, caseSensitive);
    const root = caseSensitive ? this._rootCS : this._rootCI;
    root.add(sequence, shortcut);
    return () => {
      root.remove(sequence, shortcut);
    };
  }

  setContext(key: string, value: any) {
    this._context[key] = value;
  }

  matchCondition(item: IShortcut): boolean {
    return !item.conditions || item.conditions
      .every(cond => {
        let value = this._context[cond.field];
        if (cond.not) value = !value;
        return value;
      });
  }

  handleKey = (e: KeyboardEvent) => {
    if (modifiers[e.key.toLowerCase()]) return;
    this._resetTimer();
    const keyCS = reprKey(e.key, {
      c: e.ctrlKey,
      a: e.altKey,
      m: e.metaKey,
    });
    const keyCI = reprKey(e.key.toLowerCase(), {
      c: e.ctrlKey,
      s: e.shiftKey,
      a: e.altKey,
      m: e.metaKey,
    });
    let curCS = this._curCS;
    let curCI = this._curCI;
    if (!curCS && !curCI) {
      curCS = this._rootCS;
      curCI = this._rootCI;
    }
    if (curCS) curCS = curCS.get([keyCS]);
    if (curCI) curCI = curCI.get([keyCI]);
    const shortcuts = [
      ...curCI ? curCI.shortcuts : [],
      ...curCS ? curCS.shortcuts : [],
    ].reverse();
    this._curCS = curCS;
    this._curCI = curCI;
    if (!shortcuts.length && !curCS?.children.size && !curCI?.children.size) {
      this._reset();
      return;
    }
    for (const shortcut of shortcuts) {
      if (this.matchCondition(shortcut)) {
        e.preventDefault();
        this._reset();
        shortcut.callback();
        return;
      }
    }
    this._timer = setTimeout(this._reset, this.options.sequenceTimeout);
  };
}

let service: KeyboardService;

export function register(key: string, shortcut: IShortcut, caseSensitive = false) {
  if (!service) {
    service = new KeyboardService();
  }
  service.enable();
  return service.register(key, shortcut, caseSensitive);
}

if (process.env.VM && typeof VM !== 'undefined') {
  VM.registerShortcut = (key: string, callback: () => void) => {
    console.warn('[vm-shortcut] VM.registerShortcut is deprecated in favor of VM.shortcut.register, and will be removed in 2.x');
    register(key, { callback });
  };
}
