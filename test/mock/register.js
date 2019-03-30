require('@babel/register')({
  extensions: ['.ts', '.js'],
  plugins: [
    '@babel/plugin-transform-runtime',
  ],
});
require('./index');
