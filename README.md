# 🔥 babel-plugin-ng-hot-reload

A babel plugin which enables hot module replacement in AngularJS applications.<br />
The plugin is based on the [ng-hot-reload](https://github.com/noppa/ng-hot-reload) webpack loader but is rewritten as babel plugin so that it is compatible with es-module syntax and every bundler which supports the hot-replacement API (e.g. [webpack](https://webpack.js.org/) or [parcel](https://parceljs.org/)).

## Getting started

> To see it in action you can simply checkout the examples on CodeSandbox:
>
> - [Webpack / JavaScript demo on CodeSandbox ](https://codesandbox.io/s/github/ofhouse/babel-plugin-ng-hot-reload/tree/master/examples/javascript-webpack)
> - [Webpack / TypeScript demo on CodeSandbox](https://codesandbox.io/s/github/ofhouse/babel-plugin-ng-hot-reload/tree/master/examples/typescript-webpack)
> - [Parcel / TypeScript demo on CodeSandbox](https://codesandbox.io/s/github/ofhouse/babel-plugin-ng-hot-reload/tree/master/examples/typescript-parcel) (There is an issue with HTML import, see: [FAQ](#known-issues-with-parcel))

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
        angularReference: "require('angular'), angular",
      },
    ],
  ],
};
```

### Options

| Option             | Default                                  | Description                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------ | ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `angularGlobal`    | `false` (false or string)                | Define whether angular is provided as global variable. Set to `'angular'` when `angular` is your global variable.                                                                                                                                                                                                                                                            |
| `forceRefresh`     | `true` (boolean)                         | Whether to reload window automatically when a change in source files can't be hot-reloaded. Note that Webpack DevServer also has its own option hotOnly, which should also be configured correctly to get the behavior you want when hot reloading fails.<br />([ng-hot-reload option](https://github.com/noppa/ng-hot-reload#client-options))                               |
| `preserveState`    | `true` (boolean)                         | If true, the library attempts to preserve some state in scope and controller instances when they are reloaded. Preserving state is an experimental feature and quite "hackish" so it may cause problems in some cases. Setting this to `false` might help if you run into weird errors.<br />([ng-hot-reload option](https://github.com/noppa/ng-hot-reload#client-options)) |
| `angularReference` | `"require('angular'), angular"` (string) | JavaScript expression that will be evaluated to get a reference to angular.<br />([ng-hot-reload option](https://github.com/noppa/ng-hot-reload#client-options))                                                                                                                                                                                                             |

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

### Use AngularJS as global variable

Per default the plugin looks for imports of `'angular'`-package and only adds the hot-module-reload code to this modules.
However in some environments angular is used as a global variable without being imported, so the plugin has a `angularGlobal` setting which supports the use of angular as a global variable:

```js
// Default mode: Add hot-module-reload only to files which import 'angular'
// app.module.js
import * as angular from 'angular'; // or
import angular from 'angular'; // or
import 'angular';

angular.module('hot-reload-demo', []);

////////////////////////////////////////////////////////////////////////////////

// Setting angularGlobal option: Use `angular` as global variable
// .babelrc.json
module.exports = {
  plugins: [
    [
      'babel-plugin-ng-hot-reload',
      {
        angularGlobal: 'angular', // Name of the global angular variable
      },
    ],
  ],
};

// app.module.js
angular.module('hot-reload-demo', []);
```

For an example check out the [Webpack / Javascript example](./examples/javascript-webpack/).

### Use together with `ngAnnotate`

You can also use the plugin together with [`babel-plugin-angularjs-annotate`](https://github.com/schmod/babel-plugin-angularjs-annotate).

For an example check out the [Webpack / TypeScript example](./examples/typescript-webpack/).

### Lazy-loading with `oclazyload`

This plugin also works with the lazy-loading library [ocLazyLoad](https://oclazyload.readme.io/).

For an example check out the [Webpack / TypeScript example](./examples/typescript-webpack/).

### Known issues with parcel

Since this plugin only requires babel, you can use every build tool which supports hot-module-replacement.<br />
You can check out the [Parcel / TypeScript example](./examples/typescript-parcel/) to see how it works with other bundlers than webpack.

Unfortunately there is currently an issue related to parcel:

- No hot-module-replacement for HTML templates ([parcel#943](https://github.com/parcel-bundler/parcel/issues/943))

### Browser-compatibility

The plugin is compatible with the latest versions of Chrome, Firefox and IE11.

## Author

<!-- prettier-ignore-start -->

| [<img src="https://avatars0.githubusercontent.com/u/472867?v=4" width="100px;"/><br /><sub><b>Felix Haus</b></sub>](https://github.com/ofhouse)<br /><sub>[Website](https://felix.house/) • [Twitter](https://twitter.com/ofhouse)</sub>|
| :---: |

<!-- prettier-ignore-end -->

## License

MIT - see [LICENSE](./LICENSE) for details.
