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
    ['babel-plugin-angularjs-annotate', { explicitOnly: true }],
    [
      'babel-plugin-ng-hot-reload',
      {
        angularGlobal: 'angular',
      },
    ],
    '@babel/plugin-proposal-class-properties',
  ],
};
