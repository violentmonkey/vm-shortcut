const path = require('path');
const gulp = require('gulp');
const log = require('fancy-log');
const rollup = require('rollup');
const del = require('del');
const babel = require('rollup-plugin-babel');
const replace = require('rollup-plugin-replace');
const uglify = require('rollup-plugin-uglify');
const pkg = require('./package.json');

const DIST = 'dist';
const IS_PROD = process.env.NODE_ENV === 'production';
const values = {
  'process.env.VERSION': pkg.version,
  'process.env.NODE_ENV': process.env.NODE_ENV || 'development',
};


const commonConfig = {
  input: {
    plugins: [
      // Note: rollup-plugin-babel does not support targeting latest versions
      // See https://github.com/rollup/rollup-plugin-babel/issues/212
      babel({
        exclude: 'node_modules/**',
        externalHelpers: true,
      }),
      replace({ values }),
    ],
  },
};
const rollupConfig = [
  {
    input: {
      ...commonConfig.input,
      input: 'src/index.js',
    },
    output: {
      ...commonConfig.output,
      format: 'umd',
      name: 'VM',
      file: `${DIST}/index.js`,
    },
    minify: true,
  },
];
// Generate minified versions
Array.from(rollupConfig)
.filter(({ minify }) => minify)
.forEach(config => {
  rollupConfig.push({
    input: {
      ...config.input,
      plugins: [
        ...config.input.plugins,
        uglify(),
      ],
    },
    output: {
      ...config.output,
      file: config.output.file.replace(/\.js$/, '.min.js'),
    },
  });
});

function clean() {
  return del(DIST);
}

function buildJs() {
  return Promise.all(rollupConfig.map(config => {
    return rollup.rollup(config.input)
    .then(bundle => bundle.write(config.output))
    .catch(err => {
      log(err.toString());
    });
  }));
}

function watch() {
  gulp.watch('src/**', buildJs);
}

exports.clean = clean;
exports.build = buildJs;
exports.dev = gulp.series(buildJs, watch);
