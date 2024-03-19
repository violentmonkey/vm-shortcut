/*! @violentmonkey/shortcut v1.4.4 | ISC License */
this.VM = this.VM || {};
(function (exports) {
  'use strict';

  function _extends() {
    _extends = Object.assign ? Object.assign.bind() : function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    return _extends.apply(this, arguments);
  }

  const isMacintosh = navigator.userAgent.includes('Macintosh');
  const modifierList = ['m', 'c', 's', 'a'];
  const modifiers = {
    ctrl: 'c',
    control: 'c',
    // macOS
    shift: 's',
    alt: 'a',
    meta: 'm',
    cmd: 'm'
  };
  const modifierAliases = _extends({}, modifiers, {
    c: 'c',
    s: 's',
    a: 'a',
    m: 'm',
    cm: isMacintosh ? 'm' : 'c',
    ctrlcmd: isMacintosh ? 'm' : 'c'
  });
  const modifierSymbols = {
    c: '^',
    s: '⇧',
    a: '⌥',
    m: '⌘'
  };
  const aliases = {
    arrowup: 'up',
    arrowdown: 'down',
    arrowleft: 'left',
    arrowright: 'right',
    cr: 'enter',
    escape: 'esc',
    ' ': 'space'
  };

  function createKeyNode() {
    return {
      children: new Map(),
      shortcuts: new Set()
    };
  }
  function addKeyNode(root, sequence, shortcut) {
    let node = root;
    for (const key of sequence) {
      let child = node.children.get(key);
      if (!child) {
        child = createKeyNode();
        node.children.set(key, child);
      }
      node = child;
    }
    node.shortcuts.add(shortcut);
  }
  function getKeyNode(root, sequence) {
    let node = root;
    for (const key of sequence) {
      node = node.children.get(key);
      if (!node) break;
    }
    return node;
  }
  function removeKeyNode(root, sequence, shortcut) {
    let node = root;
    const ancestors = [node];
    for (const key of sequence) {
      node = node.children.get(key);
      if (!node) return;
      ancestors.push(node);
    }
    if (shortcut) node.shortcuts.delete(shortcut);else node.shortcuts.clear();
    let i = ancestors.length - 1;
    while (i > 0) {
      node = ancestors[i];
      if (node.shortcuts.size || node.children.size) break;
      const last = ancestors[i - 1];
      last.children.delete(sequence[i - 1]);
      i -= 1;
    }
  }
  function reprNodeTree(root) {
    const result = [];
    const reprChildren = (node, level = 0) => {
      for (const [key, child] of node.children.entries()) {
        result.push(['  '.repeat(level), key, child.shortcuts.size ? ` (${child.shortcuts.size})` : ''].join(''));
        reprChildren(child, level + 1);
      }
    };
    reprChildren(root);
    return result.join('\n');
  }

  class Subject {
    constructor(value) {
      this.listeners = [];
      this.value = value;
    }
    get() {
      return this.value;
    }
    set(value) {
      this.value = value;
      this.listeners.forEach(listener => listener(value));
    }
    subscribe(callback) {
      this.listeners.push(callback);
      callback(this.value);
      return () => this.unsubscribe(callback);
    }
    unsubscribe(callback) {
      const i = this.listeners.indexOf(callback);
      if (i >= 0) this.listeners.splice(i, 1);
    }
  }

  function buildKey(key) {
    const {
      caseSensitive,
      modifierState
    } = key;
    let {
      base
    } = key;
    if (!caseSensitive || base.length > 1) base = base.toLowerCase();
    base = aliases[base] || base;
    const keyExp = [...modifierList.filter(m => modifierState[m]), base].filter(Boolean).join('-');
    return `${caseSensitive ? '' : 'i:'}${keyExp}`;
  }
  function breakKey(shortcut) {
    const pieces = shortcut.split(/-(.)/);
    const parts = [pieces[0]];
    for (let i = 1; i < pieces.length; i += 2) {
      parts.push(pieces[i] + pieces[i + 1]);
    }
    return parts;
  }
  function parseKey(shortcut, caseSensitive) {
    const parts = breakKey(shortcut);
    const base = parts.pop();
    const modifierState = {};
    for (const part of parts) {
      const key = modifierAliases[part.toLowerCase()];
      if (!key) throw new Error(`Unknown modifier key: ${part}`);
      modifierState[key] = true;
    }
    // Alt/Shift modifies the character.
    // In case sensitive mode, we only need to check the modified character: <c-A> = Ctrl+Shift+KeyA
    // In case insensitive mode, we check the keyCode as well as modifiers: <c-s-a> = Ctrl+Shift+KeyA
    // So if Alt/Shift appears in the shortcut, we must switch to case insensitive mode.
    caseSensitive && (caseSensitive = !(modifierState.a || modifierState.s));
    return {
      base,
      modifierState,
      caseSensitive
    };
  }
  function getSequence(input) {
    return Array.isArray(input) ? input : input.split(/\s+/);
  }
  function normalizeSequence(input, caseSensitive) {
    return getSequence(input).map(key => parseKey(key, caseSensitive));
  }
  function parseCondition(condition) {
    return condition.split('&&').map(key => {
      key = key.trim();
      if (!key) return;
      if (key[0] === '!') {
        return {
          not: true,
          field: key.slice(1).trim()
        };
      }
      return {
        not: false,
        field: key
      };
    }).filter(Boolean);
  }
  function reprKey(key) {
    const {
      modifierState,
      caseSensitive
    } = key;
    let {
      base
    } = key;
    if (!caseSensitive || base.length > 1) {
      base = base[0].toUpperCase() + base.slice(1);
    }
    const modifiers = modifierList.filter(m => modifierState[m]).map(m => modifierSymbols[m]);
    return [...modifiers, base].join('');
  }
  function reprShortcut(input, caseSensitive = false) {
    return getSequence(input).map(key => parseKey(key, caseSensitive)).map(key => reprKey(key)).join(' ');
  }

  const version = "1.4.4";
  class KeyboardService {
    constructor(options) {
      this._context = {};
      this._conditionData = {};
      this._data = [];
      this._root = createKeyNode();
      this.sequence = new Subject([]);
      this._timer = 0;
      this._reset = () => {
        this._cur = undefined;
        this.sequence.set([]);
        this._resetTimer();
      };
      this.handleKey = e => {
        // Chrome sends a trusted keydown event with no key when choosing from autofill
        if (!e.key || modifiers[e.key.toLowerCase()]) return;
        this._resetTimer();
        const keyExps = [
        // case sensitive mode, `e.key` is the character considering Alt/Shift
        buildKey({
          base: e.key,
          modifierState: {
            c: e.ctrlKey,
            m: e.metaKey
          },
          caseSensitive: true
        }),
        // case insensitive mode, using `e.code` with modifiers including Alt/Shift
        buildKey({
          base: e.code,
          modifierState: {
            c: e.ctrlKey,
            s: e.shiftKey,
            a: e.altKey,
            m: e.metaKey
          },
          caseSensitive: false
        }),
        // case insensitive mode, using `e.key` with modifiers
        buildKey({
          // Note: `e.key` might be different from what you expect because of Alt Graph
          // ref: https://en.wikipedia.org/wiki/AltGr_key
          base: e.key,
          modifierState: {
            c: e.ctrlKey,
            s: e.shiftKey,
            a: e.altKey,
            m: e.metaKey
          },
          caseSensitive: false
        })];
        const state = this._handleKeyOnce(keyExps, false);
        if (state) {
          e.preventDefault();
          if (state === 2) this._reset();
        }
        this._timer = window.setTimeout(this._reset, this.options.sequenceTimeout);
      };
      this.options = _extends({}, KeyboardService.defaultOptions, options);
    }
    _resetTimer() {
      if (this._timer) {
        window.clearTimeout(this._timer);
        this._timer = 0;
      }
    }
    _addCondition(condition) {
      let cache = this._conditionData[condition];
      if (!cache) {
        const value = parseCondition(condition);
        cache = {
          count: 0,
          value,
          result: this._evalCondition(value)
        };
        this._conditionData[condition] = cache;
      }
      cache.count += 1;
    }
    _removeCondition(condition) {
      const cache = this._conditionData[condition];
      if (cache) {
        cache.count -= 1;
        if (!cache.count) {
          delete this._conditionData[condition];
        }
      }
    }
    _evalCondition(conditions) {
      return conditions.every(cond => {
        let value = this._context[cond.field];
        if (cond.not) value = !value;
        return value;
      });
    }
    _checkShortcut(item) {
      const cache = item.condition && this._conditionData[item.condition];
      const enabled = !cache || cache.result;
      if (item.enabled !== enabled) {
        item.enabled = enabled;
        this._enableShortcut(item);
      }
    }
    _enableShortcut(item) {
      (item.enabled ? addKeyNode : removeKeyNode)(this._root, item.sequence, item);
    }
    enable() {
      this.disable();
      document.addEventListener('keydown', this.handleKey);
    }
    disable() {
      document.removeEventListener('keydown', this.handleKey);
    }
    register(key, callback, options) {
      const {
        caseSensitive,
        condition
      } = _extends({
        caseSensitive: false
      }, options);
      const sequence = normalizeSequence(key, caseSensitive).map(key => buildKey(key));
      const item = {
        sequence,
        condition,
        callback,
        enabled: false,
        caseSensitive
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
    setContext(key, value) {
      this._context[key] = value;
      for (const cache of Object.values(this._conditionData)) {
        cache.result = this._evalCondition(cache.value);
      }
      for (const item of this._data) {
        this._checkShortcut(item);
      }
    }
    _handleKeyOnce(keyExps, fromRoot) {
      var _cur, _cur2;
      let cur = this._cur;
      if (fromRoot || !cur) {
        // set fromRoot to true to avoid another retry
        fromRoot = true;
        cur = this._root;
      }
      if (cur) {
        let next;
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
      const [shortcut] = [...(((_cur = cur) == null ? void 0 : _cur.shortcuts) || [])];
      if (!fromRoot && !shortcut && !((_cur2 = cur) != null && _cur2.children.size)) {
        // Nothing is matched with the last key, rematch from root
        this._reset();
        return this._handleKeyOnce(keyExps, true);
      }
      if (shortcut) {
        try {
          shortcut.callback();
        } catch (_unused) {
          // ignore
        }
        return 2;
      }
      return this._cur ? 1 : 0;
    }
    repr() {
      return reprNodeTree(this._root);
    }
  }
  KeyboardService.defaultOptions = {
    sequenceTimeout: 500
  };
  let service;
  function getService() {
    if (!service) {
      service = new KeyboardService();
      service.enable();
    }
    return service;
  }
  const register = (...args) => getService().register(...args);
  const enable = () => getService().enable();
  const disable = () => getService().disable();
  const handleKey = (...args) => getService().handleKey(...args);

  exports.KeyboardService = KeyboardService;
  exports.aliases = aliases;
  exports.buildKey = buildKey;
  exports.disable = disable;
  exports.enable = enable;
  exports.getService = getService;
  exports.handleKey = handleKey;
  exports.isMacintosh = isMacintosh;
  exports.modifierAliases = modifierAliases;
  exports.modifierList = modifierList;
  exports.modifierSymbols = modifierSymbols;
  exports.modifiers = modifiers;
  exports.normalizeSequence = normalizeSequence;
  exports.parseCondition = parseCondition;
  exports.parseKey = parseKey;
  exports.register = register;
  exports.reprKey = reprKey;
  exports.reprShortcut = reprShortcut;
  exports.version = version;

})(this.VM.shortcut = this.VM.shortcut || {});
