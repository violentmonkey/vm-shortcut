import { defineExternal, definePlugins } from '@gera2ld/plaid-rollup';
import { defineConfig } from 'rollup';
import pkg from './package.json' assert { type: 'json' };

const banner = `/*! ${pkg.name} v${pkg.version} | ${pkg.license} License */`;

const bundleOptions = {
  extend: true,
  esModule: false,
};

export default defineConfig([
  {
    input: 'src/index.ts',
    plugins: definePlugins({
      esm: true,
      minimize: false,
      replaceValues: {
        'process.env.VM': false,
        'process.env.VERSION': JSON.stringify(pkg.version),
      },
    }),
    external: defineExternal(Object.keys(pkg.dependencies)),
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
        'process.env.VERSION': JSON.stringify(pkg.version),
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
]);
