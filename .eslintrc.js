module.exports = {
  root: true,
  extends: [
    require.resolve('@gera2ld/plaid-common-ts/eslint'),
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
  globals: {
    VM: true,
  },
  rules: {
    'max-classes-per-file': 'off',
  },
};
