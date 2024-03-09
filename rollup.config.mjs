import { defineExternal, definePlugins } from '@gera2ld/plaid-rollup';
import { execSync } from 'node:child_process';
import { defineConfig } from 'rollup';
import pkg from './package.json' assert { type: 'json' };

const banner = `/*! ${pkg.name} v${pkg.version} | ${pkg.license} License */`;
const commit = execSync('git rev-parse --short HEAD').toString().trim();

const bundleOptions = {
  extend: true,
  esModule: false,
};
const values = {
  'process.env.VERSION': JSON.stringify(pkg.version),
  'process.env.COMMIT': JSON.stringify(commit),
};
const external = defineExternal(
  Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }),
);

export default defineConfig([
  {
    input: 'src/index.ts',
    plugins: definePlugins({
      esm: true,
      minimize: false,
      replaceValues: {
        'process.env.VM': false,
        ...values,
      },
    }),
    external,
    output: {
      format: 'esm',
      file: `dist/index.mjs`,
      banner,
    },
  },
  {
    input: 'src/index.ts',
    plugins: definePlugins({
      esm: true,
      minimize: false,
      replaceValues: {
        'process.env.VM': true,
        ...values,
      },
    }),
    output: {
      format: 'iife',
      file: `dist/index.js`,
      name: 'VM.shortcut',
      banner,
      ...bundleOptions,
    },
  },
  ...(process.env.DEMO
    ? [
        {
          input: 'src/demo/app.js',
          plugins: definePlugins({
            esm: true,
            minimize: false,
            replaceValues: {
              'process.env.VM': true,
              ...values,
            },
          }),
          external,
          output: {
            format: 'iife',
            file: 'dist/app.js',
            globals: {
              vue: 'Vue',
            },
          },
        },
      ]
    : []),
]);
