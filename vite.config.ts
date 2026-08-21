import { defineConfig } from 'vite';
import pkg from './package.json';

const banner = `/*! ${pkg.name} v${pkg.version} | ${pkg.license} License */`;

const values = {
  __VERSION__: JSON.stringify(pkg.version),
};

const external = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies });

export default defineConfig({
  define: { ...values },
  build: {
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
  },
});
