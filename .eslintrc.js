module.exports = {
  root: true,
  extends: [
    require.resolve('@gera2ld/plaid/eslint'),
    require.resolve('@gera2ld/plaid-common-ts/eslint'),
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
  globals: {
    VM: true,
  },
  rules: {
    '@typescript-eslint/no-this-alias': 'off',
  },
};
