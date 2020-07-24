'use strict';

module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
      },
    ],
  ],
  plugins: [
    [
      'babel-plugin-ng-hot-reload',
      {
        angularGlobal: 'angular',
      },
    ],
  ],
};
