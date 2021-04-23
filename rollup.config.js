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
      index: 'src/react/index.js',
      react: 'src/react/index.js',
      Route: 'src/react/Route.jsx',
      Router: 'src/react/Router.jsx',
      useHistory: 'src/react/useHistory.js',
      useLocation: 'src/react/useLocation.js',
      usePath: 'src/react/usePath.js',
      useParams: 'src/react/useParams.js',
      useSearchParams: 'src/react/useSearchParams.js',
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
