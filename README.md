# VM.shortcut

[![NPM](https://img.shields.io/npm/v/@violentmonkey/shortcut.svg)](https://npm.im/@violentmonkey/shortcut)
![License](https://img.shields.io/npm/l/@violentmonkey/shortcut.svg)
[![jsDocs.io](https://img.shields.io/badge/jsDocs.io-reference-blue)](https://www.jsdocs.io/package/@violentmonkey/shortcut)

Register a shortcut for a function.

This is a helper script for Violentmonkey.

👉 Playground: https://violentmonkey.github.io/vm-shortcut/

## Usage

### Importing

1. Use in a userscript:

   ```js
   // ...
   // @require https://cdn.jsdelivr.net/npm/@violentmonkey/shortcut@1
   // ...

   const { register, ... } = VM.shortcut;
   ```

1. Use as a module:

   ```bash
   $ yarn add @violentmonkey/shortcut
   ```

   ```js
   import { register, ... } from '@violentmonkey/shortcut';
   ```

### Registering Shortcuts

1. Register a shortcut:

   ```js
   import { register } from '@violentmonkey/shortcut';

   register('c-i', () => {
     console.log('You just pressed Ctrl-I');
   });

   // shortcuts will be enabled by default
   ```

1. Enable or disable all shortcuts:

   ```js
   import { enable, disable } from '@violentmonkey/shortcut';

   disable();
   // ...
   enable();
   ```

1. Key sequences:

   ```js
   import { register } from '@violentmonkey/shortcut';

   register('c-a c-b', () => {
     console.log('You just pressed Ctrl-A Ctrl-B sequence');
   });
   ```

1. Handle keys with custom listeners (e.g. use with text editor like TinyMCE):

   ```js
   import { handleKey } from '@violentmonkey/shortcut';

   function onKeyDown(e) {
     handleKey(e);
   }

   addMyKeyDownListener(onKeyDown);
   ```

### Advanced Usage

The usage above is with the default keyboard service. However you can use the `KeyboardService` directly to get full control of the class:

```js
import { KeyboardService } from '@violentmonkey/shortcut';

const service = new KeyboardService();
// Or pass options
const service = new KeyboardService({
  sequenceTimeout: 500,
});

service.enable();

service.register('c-i', () => {
  console.log('You just pressed Ctrl-I');
});

// Only register the following key when `disableThisKey` is false
service.register(
  'g g',
  () => {
    console.log('Now disableThisKey is false and you pressed `g g`');
  },
  {
    condition: '!disableThisKey',
  }
);

// Update `disableThisKey` on different conditions
// Note: these callbacks are just demos, you need to implement them by yourself!!!
onOneCondition(() => {
  service.setContext('disableThisKey', true);
});
onAnotherCondition(() => {
  service.setContext('disableThisKey', false);
});

// Disable the shortcuts and unbind all events whereever you want
service.disable();

// Reenable the shortcuts later
service.enable();
```

## API

[![jsDocs.io](https://img.shields.io/badge/jsDocs.io-reference-blue)](https://www.jsdocs.io/package/@violentmonkey/shortcut)

## Key Definition

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
- `m`, `meta`, `cmd`
- `cm`, `ctrlcmd`

There is one special case, `ctrlcmd` for `ctrl` on Windows and `cmd` for macOS, so if we register `ctrlcmd-s` to save something, the callback will be called when `ctrl-s` is pressed on Windows, and when `cmd-s` is pressed on macOS. This is useful to register cross-platform shortcuts.

## Condition Syntax

- `conditionA` - when `conditionA` is truthy
- `!conditionB` - when `conditionB` is falsy
- `conditionA && conditionB` - when both `conditionA` and `conditionB` are truthy

For more complicated cases, it's recommended to handle the logic in a function and store the result as a simple condition to the context.
