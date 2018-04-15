VM.registerShortcut
---

Register a shortcut for a function.

This is a helper script for Violentmonkey.

Usage
---

1. Use in a userscript:

   ```js
   // ...
   // @require https://unpkg.com/vm.shortcut
   // ...

   VM.registerShortcut('c-i', () => {
     console.log('You have pressed Ctrl-I');
   });
   ```

2. Use as a module:

   ```sh
   $ yarn add vm.shortcut
   ```

   ```js
   import VM from 'vm.shortcut';

   VM.registerShortcut('c-i', () => {
     console.log('You have pressed Ctrl-I');
   });
   ```
