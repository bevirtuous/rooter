const babel = require('rollup-plugin-babel');
const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const replace = require('@rollup/plugin-replace');
const copy = require('rollup-plugin-copy');

const env = process.env.NODE_ENV;

module.exports = [
  {
    external: ['react', 'react-dom', 'rxjs', 'rxjs/operators', 'svelte'],
    input: {
      index: 'src/core/index.js',
      react: 'src/react/index.js',
      rx: 'src/rx/index.js',
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
      copy({
        targets: [
          {
            src: [
              'src/svelte/index.js',
              'src/svelte/store.js',
              'src/svelte/Link.svelte',
              'src/svelte/Route.svelte',
            ],
            dest: ['cjs/svelte', 'esm/svelte'],
          },
        ],
      }),
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
    ],
  },
];
