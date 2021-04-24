# VM.shortcut

[![NPM](https://img.shields.io/npm/v/@violentmonkey/shortcut.svg)](https://npm.im/@violentmonkey/shortcut)
![License](https://img.shields.io/npm/l/@violentmonkey/shortcut.svg)

Register a shortcut for a function.

This is a helper script for Violentmonkey.

## Usage

1. Use in a userscript:

   ```js
   // ...
   // @require https://cdn.jsdelivr.net/npm/@violentmonkey/shortcut@1
   // ...

   VM.shortcut.register('c-i', () => {
     console.log('You just pressed Ctrl-I');
   });
   ```

2. Use as a module:

   ```bash
   $ yarn add @violentmonkey/shortcut
   ```

   ```js
   import { register } from '@violentmonkey/shortcut';

   register('c-i', () => {
     console.log('You just pressed Ctrl-I');
   });
   ```

3. Key sequences:

   ```js
   import { register } from '@violentmonkey/shortcut';

   register('c-a c-b', () => {
     console.log('You just pressed Ctrl-A Ctrl-B sequence');
   });
   ```

## Key definition

A key sequence is a space-separated list of combined keys. Each combined key is composed of zero or more modifiers and exactly one base key in the end, concatenated with dashes (`-`). The modifiers are always case-insensitive and can be abbreviated as their first letters.

Here are some valid examples:

```
ctrl-alt-c
ctrl-a-c
c-a-c
```

Possible modifiers are:

- `c`, `ctrl`, `control`
- `s`, `shift`
- `a`, `alt`
- `m`, `meta`
- `ctrlcmd`

There is one special case, `ctrlcmd` for `ctrl` on Windows and `cmd` for macOS, so if we register `ctrlcmd-s` to save something, the callback will be called when `ctrl-s` is pressed on Windows, and when `cmd-s` is pressed on macOS. This is useful to register cross-platform shortcuts.
