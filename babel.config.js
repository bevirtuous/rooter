module.exports = (api) => {
  api.cache(false);

  return {
    plugins: [
      '@babel/plugin-proposal-class-properties',
      ['@babel/plugin-transform-runtime', {
        helpers: false,
        regenerator: true,
      }],
    ],
    env: {
      test: {
        presets: [
          ['@babel/preset-env', { modules: 'cjs' }]
        ]
      },
      build: {
        presets: [
          ['@babel/preset-env', { modules: false }]
        ]
      }
    }
  };
};