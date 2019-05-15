const rollup = require('rollup');
const { uglify } = require('rollup-plugin-uglify');
const { getRollupPlugins, getExternal, DIST } = require('./scripts/util');
const pkg = require('./package.json');

const FILENAME = 'index';
const BANNER = `/*! ${pkg.name} v${pkg.version} | ${pkg.license} License */`;

const external = getExternal();
const rollupConfig = [
  {
    input: {
      input: 'src/index.js',
      plugins: getRollupPlugins({ browser: true }),
    },
    output: {
      format: 'iife',
      file: `${DIST}/${FILENAME}.js`,
      name: 'VM',
      extend: true,
      esModule: false,
    },
    minify: true,
  },
];
// Generate minified versions
rollupConfig.filter(({ minify }) => minify)
.forEach(config => {
  rollupConfig.push({
    input: {
      ...config.input,
      plugins: [
        ...config.input.plugins,
        uglify({
          output: {
            ...BANNER && {
              preamble: BANNER,
            },
          },
        }),
      ],
    },
    output: {
      ...config.output,
      file: config.output.file.replace(/\.js$/, '.min.js'),
    },
  });
});

rollupConfig.forEach((item) => {
  item.output = {
    indent: false,
    ...item.output,
    ...BANNER && {
      banner: BANNER,
    },
  };
});

module.exports = rollupConfig.map(({ input, output }) => ({
  ...input,
  output,
}));
