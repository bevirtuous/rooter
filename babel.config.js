module.exports = (api) => {
  api.cache(true);

  return {
    presets: [
      ['@babel/env', {
        loose: true,
        modules: false,
      }],
    ],
    plugins: [
      ['@babel/plugin-proposal-class-properties', {
        loose: true,
      }],
      ['@babel/plugin-proposal-object-rest-spread', {
        loose: true,
      }],
      '@babel/plugin-transform-react-jsx',
    ],
  };
};
