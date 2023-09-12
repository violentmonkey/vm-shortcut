const { createApp, nextTick, ref, watch, onMounted } = Vue;
createApp({
  setup() {
    const shortcuts = ref(`\
g g
c-a c-b
a-a a-b
ArrowUp ArrowUp ArrowDown ArrowDown ArrowLeft ArrowRight ArrowLeft ArrowRight B A`);
    const keyExpCS = ref('');
    const keyExpCI = ref('');
    const keyExpCICode = ref('');
    const keyTriggered = ref('');
    const sequence = ref('');
    const caseSensitive = ref(false);
    let disposeList = [];

    watch(
      [shortcuts, caseSensitive],
      () => {
        disposeList.forEach((dispose) => dispose());
        disposeList = shortcuts.value
          .split('\n')
          .map((row) => row.trim())
          .filter(Boolean)
          .map((key) => {
            console.log('register', key, caseSensitive.value);
            return VM.shortcut.register(
              key,
              () => {
                nextTick(() => {
                  keyTriggered.value = key;
                });
              },
              {
                caseSensitive: caseSensitive.value,
              },
            );
          });
      },
      { immediate: true },
    );
    watch(sequence, () => {
      keyTriggered.value = '';
    });

    onMounted(() => {
      VM.shortcut.disable();
      VM.shortcut.getService().sequence.subscribe((seq) => {
        sequence.value = seq.join(' ');
      });
      window.addEventListener('keydown', (e) => {
        if (!VM.shortcut.modifiers[e.key.toLowerCase()]) {
          keyExpCS.value = VM.shortcut.buildKey({
            base: e.key,
            modifierState: {
              c: e.ctrlKey,
              m: e.metaKey,
            },
            caseSensitive: true,
          });
          keyExpCICode.value = VM.shortcut
            .buildKey({
              base: e.code,
              modifierState: {
                c: e.ctrlKey,
                s: e.shiftKey,
                a: e.altKey,
                m: e.metaKey,
              },
              caseSensitive: false,
            })
            .replace(/^i:/, '');
          keyExpCI.value = VM.shortcut
            .buildKey({
              base: VM.shortcut.getOriginalKey(e),
              modifierState: {
                c: e.ctrlKey,
                s: e.shiftKey,
                a: e.altKey,
                m: e.metaKey,
              },
              caseSensitive: false,
            })
            .replace(/^i:/, '');
        }
        VM.shortcut.handleKey(e);
      });
    });

    return {
      shortcuts,
      sequence,
      keyTriggered,
      keyExpCS,
      keyExpCI,
      keyExpCICode,
      caseSensitive,
    };
  },
}).mount('#app');