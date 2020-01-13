const babel = require('rollup-plugin-babel');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');
const replace = require('@rollup/plugin-replace');
const builtins = require('builtin-modules');
const pkg = require('./package.json');

const env = process.env.NODE_ENV;

const config = {
  input: {
    core: 'src/core/index.js',
    react: 'src/react/index.js',
    rx: 'src/rx/index.js',
  },
  output: {
    dir: 'dist',
    entryFileNames: '[name].js',
    format: 'cjs',
  },
  external: Object.keys(pkg.peerDependencies || {}).concat('react-dom').concat(builtins),
  plugins: [
    babel({
      exclude: 'node_modules/**',
    }),
    json(),
    resolve({
      preferBuiltins: false,
      extensions: ['.mjs', '.js', '.jsx', '.json', '.node'],
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(env),
    }),
    commonjs(),
  ],
};

module.exports = config;
