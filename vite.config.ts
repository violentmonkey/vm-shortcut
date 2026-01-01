import { execSync } from 'node:child_process';
import { BuildEnvironmentOptions, defineConfig } from 'vite';
import pkg from './package.json';

const banner = `/*! ${pkg.name} v${pkg.version} | ${pkg.license} License */`;
const commit = execSync('git rev-parse --short HEAD').toString().trim();

const values = {
  __VERSION__: JSON.stringify(pkg.version),
  __COMMIT__: JSON.stringify(commit),
};

const external = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });

export default defineConfig(({ mode }) => {
  const define = { ...values };
  let build: BuildEnvironmentOptions = {};

  if (mode === 'demo') {
    build = {
      outDir: 'dist/demo',
      rollupOptions: {
        input: {
          app: 'src/demo/app.js',
        },
        output: {
          format: 'iife',
          entryFileNames: 'app.js',
          globals: {
            vue: 'Vue',
          },
        },
        external,
      },
    };
  } else {
    build = {
      outDir: 'dist',
      sourcemap: true,
      lib: {
        entry: 'src/index.ts',
        name: 'VM.shortcut',
        fileName: 'index',
        formats: ['es', 'iife'],
      },
      rollupOptions: {
        output: {
          banner,
          extend: true,
        },
        external,
      },
    };
  }

  return {
    define,
    build,
  };
});

