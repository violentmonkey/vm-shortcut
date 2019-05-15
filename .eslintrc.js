module.exports = {
  root: true,
  extends: [
    require.resolve('@gera2ld/plaid/eslint'),
  ],
  settings: {
    'import/resolver': {
      'babel-module': {},
    },
  },
  globals: {
    VM: true,
  },
  rules: {
    'import/prefer-default-export': 'off',
  },
};
