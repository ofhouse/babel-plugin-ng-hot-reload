'use strict';

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
      },
    ],
    '@babel/preset-typescript',
  ],
  plugins: [
    '@babel/plugin-transform-runtime',
    ['babel-plugin-angularjs-annotate', { explicitOnly: true }],
    'babel-plugin-ng-hot-reload',
    '@babel/plugin-proposal-class-properties',
  ],
};
