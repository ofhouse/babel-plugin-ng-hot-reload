# 🔥 babel-plugin-ng-hot-reload

A babel plugin which enables hot module replacement in angular.js applications.<br />
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
        forceRefresh: false,
        preserveState: false,
      },
    ],
  ],
};
```

### Options

## FAQ

### Use it together with `@babel/preset-env`

This plugin should be work nicly together with the `@babel/preset-env` plugin.
In opposite to the original webpack-loader it's **not** required to transpile your code to commonjs modules:

```js
module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false, // Don't transpile the modules
      },
    ],
  ],
  plugins: ['babel-plugin-ng-hot-reload'],
};
```

For an example check out the [Webpack / Javascript example](./examples/javascript-webpack/).

### Use together with ngAnnotate

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
