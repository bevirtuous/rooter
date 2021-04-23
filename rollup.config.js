import cleanup from 'rollup-plugin-cleanup';

const babel = require('rollup-plugin-babel');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const replace = require('@rollup/plugin-replace');

const env = process.env.NODE_ENV;

module.exports = [
  {
    external: [
      'history/browser',
      'react',
      'react-dom',
      'zustand',
    ],
    input: {
      plugins: 'src/plugins/index.js',
      react: 'src/react/index.js',
    },
    output: [
      {
        chunkFileNames: 'chunk-[hash].js',
        dir: 'cjs',
        format: 'cjs',
      },
      {
        chunkFileNames: 'chunk-[hash].js',
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
        extensions: ['.mjs', '.js', '.jsx', '.json', '.node'],
      }),
      replace({
        'process.env.NODE_ENV': JSON.stringify(env),
      }),
      commonjs(),
      cleanup(),
    ],
  },
];
