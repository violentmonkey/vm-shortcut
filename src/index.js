import { modifiers, normalizeKey, normalizeShortcut } from './util';

const VM = window.VM || {};
VM.registerShortcut = registerShortcut;
export default VM;
let keys = null;

function log(...args) {
  console.info('[VM.shortcut]', ...args);
}

function initializeShortcut() {
  keys = {};
  document.addEventListener('keydown', e => {
    if (modifiers[e.key.toLowerCase()]) return;
    const key = normalizeKey(e.key, {
      c: e.ctrlKey,
      s: e.shiftKey,
      a: e.altKey,
      m: e.metaKey,
    });
    if (VM.debug) log('keydown:', key);
    const callbacks = keys[key];
    if (callbacks) callbacks.forEach(callback => { callback(); });
  }, true);
}

function registerShortcut(shortcut, callback) {
  if (!keys) initializeShortcut();
  const normalizedKey = normalizeShortcut(shortcut);
  if (VM.debug) log('register:', normalizedKey);
  let callbacks = keys[normalizedKey];
  if (!callbacks) {
    callbacks = [];
    keys[normalizedKey] = callbacks;
  }
  callbacks.push(callback);
  return () => {
    const i = callbacks.indexOf(callback);
    if (i >= 0) callbacks.splice(i, 1);
  };
}
