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
     console.log('You have pressed Ctrl-I');
   });
   ```

2. Use as a module:

   ```bash
   $ yarn add @violentmonkey/shortcut
   ```

   ```js
   import { register } from '@violentmonkey/shortcut';

   register('c-i', () => {
     console.log('You have pressed Ctrl-I');
   });
   ```

3. Key sequences:

   ```js
   import { register } from '@violentmonkey/shortcut';

   register('c-a c-b', () => {
     console.log('You just pressed Ctrl-A Ctrl-B sequence');
   });
   ```
