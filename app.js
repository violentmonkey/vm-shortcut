(function (vue) {
  'use strict';

  vue.createApp({
    setup() {
      const shortcuts = vue.ref(`\
g g
c-a c-b
a-a a-b
ArrowUp ArrowUp ArrowDown ArrowDown ArrowLeft ArrowRight ArrowLeft ArrowRight B A`);
      const keyExpCS = vue.ref('');
      const keyExpCI = vue.ref('');
      const keyExpCICode = vue.ref('');
      const keyTriggered = vue.ref('');
      const sequence = vue.ref('');
      const caseSensitive = vue.ref(false);
      let disposeList = [];
      const onFocus = () => {
        VM.shortcut.getService().setContext('input', true);
      };
      const onBlur = () => {
        VM.shortcut.getService().setContext('input', false);
      };
      vue.watch([shortcuts, caseSensitive], () => {
        disposeList.forEach(dispose => dispose());
        disposeList = shortcuts.value.split('\n').map(row => row.trim()).filter(Boolean).map(key => {
          console.log('register', key, caseSensitive.value);
          return VM.shortcut.register(key, () => {
            vue.nextTick(() => {
              keyTriggered.value = key;
            });
          }, {
            caseSensitive: caseSensitive.value,
            condition: '!input'
          });
        });
      }, {
        immediate: true
      });
      vue.watch(sequence, () => {
        keyTriggered.value = '';
      });
      vue.onMounted(() => {
        VM.shortcut.disable();
        VM.shortcut.getService().sequence.subscribe(seq => {
          sequence.value = seq.join(' ');
        });
        window.addEventListener('keydown', e => {
          if (!VM.shortcut.modifiers[e.key.toLowerCase()]) {
            keyExpCS.value = VM.shortcut.buildKey({
              base: e.key,
              modifierState: {
                c: e.ctrlKey,
                m: e.metaKey
              },
              caseSensitive: true
            });
            keyExpCICode.value = VM.shortcut.buildKey({
              base: e.code,
              modifierState: {
                c: e.ctrlKey,
                s: e.shiftKey,
                a: e.altKey,
                m: e.metaKey
              },
              caseSensitive: false
            }).replace(/^i:/, '');
            keyExpCI.value = VM.shortcut.buildKey({
              base: e.key,
              modifierState: {
                c: e.ctrlKey,
                s: e.shiftKey,
                a: e.altKey,
                m: e.metaKey
              },
              caseSensitive: false
            }).replace(/^i:/, '');
          }
          VM.shortcut.handleKey(e);
        });
      });
      return {
        version: VM.shortcut.version,
        commit: "a73ae92",
        shortcuts,
        sequence,
        keyTriggered,
        keyExpCS,
        keyExpCI,
        keyExpCICode,
        caseSensitive,
        onFocus,
        onBlur
      };
    }
  }).mount('#app');

})(Vue);
