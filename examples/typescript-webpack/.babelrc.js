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
    ['angularjs-annotate', { explicitOnly: true }],
    'babel-plugin-ng-hot-reload',
    '@babel/plugin-proposal-class-properties',
  ],
};
