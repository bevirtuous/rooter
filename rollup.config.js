import cleanup from 'rollup-plugin-cleanup';

const babel = require('rollup-plugin-babel');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');

module.exports = [
  {
    external: [
      'history/browser',
      'react',
      'zustand',
    ],
    input: {
      plugins: 'src/plugins/index.js',
      react: 'src/react/index.js',
    },
    output: [
      {
        dir: 'cjs',
        format: 'cjs',
      },
      {
        dir: 'esm',
        format: 'esm',
      },
    ],
    plugins: [
      babel({
        exclude: 'node_modules/**',
        presets: ['@babel/env', '@babel/preset-react'],
      }),
      resolve({
        preferBuiltins: false,
        extensions: ['.js', '.jsx'],
      }),
      commonjs(),
      cleanup(),
    ],
  },
];
