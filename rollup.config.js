import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

module.exports = {
  input: 'src/index.js',
  output: {
    file: 'dist/index.js',
    format: 'esm'
  },
  external: ['react'],
  plugins: [
    babel({
      exclude: 'node_modules/**',
      presets: ['@babel/env', '@babel/preset-react']
    }),
    resolve(),
    commonjs(),
  ]
};