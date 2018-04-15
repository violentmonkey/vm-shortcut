const path = require('path');
const gulp = require('gulp');
const log = require('fancy-log');
const rollup = require('rollup');
const del = require('del');
const pkg = require('./package.json');

const DIST = 'dist';
const IS_PROD = process.env.NODE_ENV === 'production';
const values = {
  'process.env.VERSION': pkg.version,
  'process.env.NODE_ENV': process.env.NODE_ENV || 'development',
};


const rollupOptions = {
  plugins: [
    require('rollup-plugin-babel')({
      runtimeHelpers: true,
      exclude: 'node_modules/**',
    }),
    require('rollup-plugin-replace')({ values }),
  ],
};

function clean() {
  return del(DIST);
}

function buildJs() {
  return rollup.rollup(Object.assign({
    input: 'src/index.js',
  }, rollupOptions))
  .then(bundle => bundle.write({
    name: 'VM',
    file: `${DIST}/index.js`,
    format: 'umd',
  }))
  .catch(err => {
    log(err.toString());
  });
}

function watch() {
  gulp.watch('src/**', buildJs);
}

exports.clean = clean;
exports.build = buildJs;
exports.dev = gulp.series(buildJs, watch);
