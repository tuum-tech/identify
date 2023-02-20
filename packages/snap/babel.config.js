// @type {import('@babel/core').ConfigFunction}
// eslint-disable-next-line import/no-anonymous-default-export
export default (api) => {
  // Cache configuration is a required option
  api.cache(false);

  const presets = [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
  ];
  // Plugins needed for class validator tests
  const plugins = [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-transform-flow-strip-types'],
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    ['@babel/plugin-proposal-private-methods', { loose: true }],
  ];

  return { presets, plugins };
};
