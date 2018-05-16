VM.registerShortcut
---

![NPM](https://img.shields.io/npm/v/vm.shortcut.svg)
![License](https://img.shields.io/npm/l/vm.shortcut.svg)

Register a shortcut for a function.

This is a helper script for Violentmonkey.

### Usage

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

### API

- VM.registerShortcut(*shortcut*, *callback*)

  - Parameters:

    - *shortcut*: string

      Dash connected key combinations, modifiers first. Here are some good examples:

      ```
      # Ctrl + I
      c-i
      Ctrl-I
      ctrl-i

      # Ctrl + Shift + A
      c-s-a
      Ctrl-Shift-A
      ctrl-shift-a
      Shift-Ctrl-A
      ```

    - *callback*: function
