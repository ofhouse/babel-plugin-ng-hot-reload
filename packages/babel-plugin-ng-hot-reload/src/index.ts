import * as Babel from '@babel/core';

type BabelT = typeof Babel;
type PluginOptions = {};

export default function(babel: BabelT, options: PluginOptions = {}) {
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

      ExportNamedDeclaration(path) {
        const declaration = path.get('declaration');
        if (declaration.node !== null) {
          if (declaration.type === 'VariableDeclaration') {
            // Export variable declaration
            // e.g:
            // export const foo = 'bar',
            //              bar = 'foo';
            const { declarations } = declaration.node;
            declarations.forEach(declaration => {
              const identifier = declaration.id;
              state.topLevelExports.set(identifier.name, identifier);
            });
          } else {
            // Export right before declaration
            // e.g:
            // export class Foo {};
            const identifier = declaration.get('id').node;
            state.topLevelExports.set(identifier.name, identifier);
          }
          // Replace the export declaration with the actual declaration
          path.replaceWith(declaration);
        } else {
          // Export specifier
          // e.g:
          // const foo = 'bar';
          // const bar = 'foo';
          // export { foo, bar as bar2 };
          const { specifiers } = path.node;
          if (specifiers && specifiers.length > 0) {
            specifiers.forEach(({ local, exported }) => {
              state.topLevelExports.set(exported.name, local);
            });
          }
          // Remove the export
          path.remove();
        }
      },

      ExportDefaultDeclaration(path) {
        const declaration = path.get('declaration');
        if (declaration.type === 'Identifier' || declaration.type === 'MemberExpression') {
          // If export is a simple identifier we can use the node directly
          //
          // Identifier:
          // const foo = 'bar';
          // export default foo;
          //
          // MemberExpression:
          // const obj = {
          //   foo: 'bar'
          // };
          // export default obj.foo;
          state.topLevelExports.set('default', declaration.node);
          // Remove the default export
          path.remove();
        } else {
          // If we have a declaration in the default export we have to get the
          // identifier through the `id` property
          // e.g:
          // export default class Foo {}
          state.topLevelExports.set('default', declaration.get('id').node);
          // Replace the export declaration with the actual declaration
          path.replaceWith(declaration);
        }
      },
    },
  };
}
