export default function(babel) {
  const { types: t } = babel;

  const state = {
    topLevelImports: new Set(),
    topLevelExports: new Map(),
  };

  const corePath = JSON.stringify(require.resolve('ng-hot-reload-core'));
  // const corePath = "testPath";
  const requireAngular = '(require("angular"), angular)';

  const forceRefresh = false;
  const preserveState = false;
  const SOURCE_PLACEHOLDER = '__SOURCE_PLACEHOLDER__';
  const EXPORTS_PLACEHOLDER = '__EXPORTS_PLACEHOLDER__';
  const EXPORTS_PREFIX = '$$__export__';

  const hotReloadTemplate = `
/* ng-hot-reload-loader */
const { } = (function(__ngHotReloadLoaderAngularGlobal) {
  var $$__exports__;
  var angular = module.hot ? (function() {
    var loader = require(${corePath});
    return loader.decorateAngular({
      angular: __ngHotReloadLoaderAngularGlobal,
      forceRefresh: Boolean(${forceRefresh}),
      preserveState: Boolean(${preserveState})
    });
  })() : __ngHotReloadLoaderAngularGlobal;

  try {
    $$__exports__ = (function() {

      /* ng-hot-reload-loader end*/
      '${SOURCE_PLACEHOLDER}';
      '${EXPORTS_PLACEHOLDER}';
      /* ng-hot-reload-loader */

    })();
  } finally {
    (function() {
      if (module.hot && angular.__ngHotReload$didRegisterProviders) {
        module.hot.accept(function(err) {
          if (err) {
            console.error(err);
          }
        });
      }
    })();
  }
  return $$__exports__;
})(${requireAngular});
/* ng-hot-reload-loader end */
`;

  return {
    name: 'ng-hot-reload', // not required
    post() {
      // Clear the storage after each file
      state.topLevelImports.clear();
      state.topLevelExports.clear();
    },

    visitor: {
      Program: {
        exit(path) {
          const {
            node: { body: sourceBody },
          } = path;

          const parsedTemplate = babel.parse(hotReloadTemplate);
          babel.traverse(parsedTemplate, {
            Directive(path) {
              const { node } = path;

              // Add the source code to the SOURCE_PLACEHOLDER
              if (
                node.value &&
                node.value.type === 'DirectiveLiteral' &&
                node.value.value === SOURCE_PLACEHOLDER
              ) {
                path.replaceWithMultiple(sourceBody);
              }

              if (
                node.value &&
                node.value.type === 'DirectiveLiteral' &&
                node.value.value === EXPORTS_PLACEHOLDER
              ) {
                const __exports = [];
                state.topLevelExports.forEach((value, key) => {
                  __exports.push(t.objectProperty(t.identifier(`${EXPORTS_PREFIX}${key}`), value));
                });

                path.replaceWith(t.returnStatement(t.objectExpression(__exports)));
              }
            },

            VariableDeclaration(path) {
              if (path.parent.type === 'Program') {
                const __exports = [];
                state.topLevelExports.forEach((_, key) => {
                  __exports.push(
                    t.objectProperty(
                      t.identifier(`${EXPORTS_PREFIX}${key}`),
                      t.identifier(`${EXPORTS_PREFIX}${key}`),
                      false,
                      true
                    )
                  );
                });

                path
                  .get('declarations')[0]
                  .get('id')
                  .replaceWith(t.objectPattern(__exports));
              }
            },
          });

          const __exports = [];
          state.topLevelExports.forEach((value, key) => {
            __exports.push(
              t.exportSpecifier(t.identifier(`${EXPORTS_PREFIX}${key}`), t.identifier(key))
            );
          });

          const finalExports = t.exportNamedDeclaration(null, __exports);

          const finalBody = [...state.topLevelImports.values(), parsedTemplate];
          if (__exports.length) {
            finalBody.push(finalExports);
          }

          path.node.body = finalBody;
        },
      },

      ImportDeclaration(path) {
        const node = path.node;

        // Add it to the list and remove it from the code
        state.topLevelImports.add(node);
        path.remove();
      },

      ExportDefaultDeclaration(path) {
        const node = path.node;
        const name = node.declaration.name;
        state.topLevelExports.set('default', path.get('declaration').node);
        path.remove();
      },
    },
  };
}
