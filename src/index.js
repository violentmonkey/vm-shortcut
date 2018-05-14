const VM = window.VM || {};
VM.registerShortcut = registerShortcut;
export default VM;
let keys = null;

function normalizeKey(base, {
  c, s, a, m,
}) {
  return [
    c && 'c',
    s && 's',
    a && 'a',
    m && 'm',
    base,
  ].filter(Boolean).join('-');
}

function initializeShortcut() {
  keys = {};
  document.addEventListener('keydown', e => {
    const base = String.fromCharCode(e.keyCode).toLowerCase();
    if (!base) return;
    const key = normalizeKey(base, {
      c: e.ctrlKey,
      s: e.shiftKey,
      a: e.altKey,
      m: e.metaKey,
    });
    const callbacks = keys[key];
    if (callbacks) callbacks.forEach(callback => { callback(); });
  }, true);
}

function registerShortcut(key, callback) {
  if (!keys) initializeShortcut();
  const parts = key.toLowerCase().split('-');
  const base = parts.pop();
  const modifiers = parts.reduce((map, c) => ({
    ...map,
    [c]: true,
  }), {});
  const normalizedKey = normalizeKey(base, modifiers);
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
