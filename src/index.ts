import {
  modifiers, normalizeKey, normalizeShortcut, IShortcut,
} from './util';

export class KeyboardService {
  private _context: { [key: string]: any } = {};

  private _data: { [key: string]: IShortcut[] } = {};

  enable() {
    this.disable();
    document.addEventListener('keydown', this.handleKey);
  }

  disable() {
    document.removeEventListener('keydown', this.handleKey);
  }

  register(key: string, item: IShortcut) {
    const normalizedKey = normalizeShortcut(key);
    let items = this._data[normalizedKey];
    if (!items) {
      items = [];
      this._data[normalizedKey] = items;
    }
    items.push(item);
    return () => {
      const i = items.indexOf(item);
      if (i >= 0) items.splice(i, 1);
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
    const key = normalizeKey(e.key, {
      c: e.ctrlKey,
      s: e.shiftKey,
      a: e.altKey,
      m: e.metaKey,
    });
    const items = this._data[key];
    if (items) {
      for (const item of items) {
        if (this.matchCondition(item)) {
          e.preventDefault();
          item.callback();
          break;
        }
      }
    }
  };
}

let service: KeyboardService;

export function registerShortcut(key: string, callback: () => void) {
  if (!service) {
    service = new KeyboardService();
  }
  service.enable();
  service.register(key, { callback });
}