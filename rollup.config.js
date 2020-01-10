const babel = require('rollup-plugin-babel');
const commonjs = require('@rollup/plugin-commonjs');
const resolve = require('@rollup/plugin-node-resolve');
const { terser } = require('rollup-plugin-terser');
const replace = require('@rollup/plugin-replace');
const pkg = require('./package.json');

const env = process.env.NODE_ENV;

const config = {
  input: 'src/index.js',
  external: Object.keys(pkg.peerDependencies || {}).concat('react-dom'),
  output: {
    file: 'dist/index.js',
    format: 'cjs',
  },
  plugins: [
    resolve({
      extensions: ['.mjs', '.js', '.jsx', '.json', '.node'],
    }),
    babel({
      exclude: 'node_modules/**',
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(env),
    }),
    commonjs(),
  ],
};

if (env === 'production') {
  config.plugins.push(
    terser({
      compress: {
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        warnings: false,
      },
    })
  );
}

module.exports = config;
