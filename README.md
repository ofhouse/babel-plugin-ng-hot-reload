# 🔥 babel-plugin-ng-hot-reload

A babel plugin which enables hot module replacement in AngularJS applications.<br />
The plugin is based on the [ng-hot-reload](https://github.com/noppa/ng-hot-reload) webpack loader but is rewritten as babel plugin so that it is compatible with es-module syntax and every bundler which supports the hot-replacement API (e.g. [webpack](https://webpack.js.org/) or [parcel](https://parceljs.org/)).

## Getting started

> To see it in action you can simply checkout the examples on CodeSandbox:
>
> - [Webpack / JavaScript demo on CodeSandbox ](https://codesandbox.io/s/github/ofhouse/babel-plugin-ng-hot-reload/tree/master/examples/javascript-webpack)
> - [Webpack / TypeScript demo on CodeSandbox](https://codesandbox.io/s/github/ofhouse/babel-plugin-ng-hot-reload/tree/master/examples/typescript-webpack)

```sh
npm i -D babel-plugin-ng-hot-reload     # npm or
yarn add -D babel-plugin-ng-hot-reload  # yarn
```

Add the following to your `babelrc.js` file:

```js
// without options
module.exports = {
  plugins: ['babel-plugin-ng-hot-reload'],
};

// with options
module.exports = {
  plugins: [
    [
      'babel-plugin-ng-hot-reload',
      {
        angularGlobal: false,
        forceRefresh: true,
        preserveState: true,
      },
    ],
  ],
};
```

### Options

| Option          | Default                   | Description                                                                                                                                                                                                                                                                                                                                                                  |
| --------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `angularGlobal` | `false` (false or string) | Define whether angular is used as global variable. Set to `'angular'` when `angular` is your global variable.                                                                                                                                                                                                                                                                |
| `forceRefresh`  | `true` (boolean)          | Whether to reload window automatically when a change in source files can't be hot-reloaded. Note that Webpack DevServer also has its own option hotOnly, which should also be configured correctly to get the behaviour you want when hot reloading fails.<br />([ng-hot-reload option](https://github.com/noppa/ng-hot-reload#client-options))                              |
| `preserveState` | `true` (boolean)          | If true, the library attempts to preserve some state in scope and controller instances when they are reloaded. Preserving state is an experimental feature and quite "hackish" so it may cause problems in some cases. Setting this to `false` might help if you run into weird errors.<br />([ng-hot-reload option](https://github.com/noppa/ng-hot-reload#client-options)) |

## FAQ

### Use together with `@babel/preset-env`

This plugin should work nicely together with the [`@babel/preset-env`](https://babeljs.io/docs/en/babel-preset-env) plugin.
In opposite to the original ng-hot-reload webpack-loader it's **not** required to transpile your code to commonjs modules:

```js
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false, // Don't transpile the modules (default)
      },
    ],
  ],
  plugins: ['babel-plugin-ng-hot-reload'],
};
```

For an example check out the [Webpack / Javascript example](./examples/javascript-webpack/).

### Use together with `ngAnnotate`

When you are using this plugin together with [`babel-plugin-angularjs-annotate`](https://github.com/schmod/babel-plugin-angularjs-annotate) make sure that the ngAnnotate plugin is added before this plugin in your `.babelrc.js`:

```js
module.exports = {
  plugins: ['angularjs-annotate', 'babel-plugin-ng-hot-reload'],
};
```

For an example check out the [Webpack / TypeScript example](./examples/typescript-webpack/).

## Author

<!-- prettier-ignore-start -->

| [<img src="https://avatars0.githubusercontent.com/u/472867?v=4" width="100px;"/><br /><sub><b>Felix Haus</b></sub>](https://github.com/ofhouse)<br /><sub>[Website](https://felix.house/) • [Twitter](https://twitter.com/ofhouse)</sub>|
| :---: |

<!-- prettier-ignore-end -->

## License

MIT - see [LICENSE](./LICENSE) for details.
