module.exports = (api) => {
  api.cache(true);

  return {
    presets: [
      ['@babel/preset-env', {
        modules: false,
      }],
      '@babel/preset-react',
    ],
    plugins: [
      ['@babel/plugin-proposal-object-rest-spread', {
        loose: true,
      }],
      ['@babel/plugin-transform-runtime', {
        helpers: false,
        regenerator: true,
      }],
    ],
    env: {
      test: {
        presets: [
          ['@babel/preset-env', { modules: 'cjs' }],
        ],
      },
    },
  };
};
