import * as Babel from '@babel/core';

type BabelT = typeof Babel;
type PluginOptions = {
  angularGlobal: false | string;
  forceRefresh: boolean;
  preserveState: boolean;
};

export default function(
  babel: BabelT,
  { angularGlobal = false, forceRefresh = true, preserveState = true }: PluginOptions
) {
  const { types: t, template } = babel;

  let state = {
    topLevelImports: new Set(),
    topLevelExports: new Map(),
    pathsToRemove: new Set(),
    pathsToReplace: new Map(),
  };
  const registerAngularUse = new Map();

  const corePath = 'ng-hot-reload-core';
  const requireAngular = 'require("angular"), angular';
  const EXPORTS_PREFIX = '__ngHotReload_';
  const INNER_EXPORT_VARIABLE = '__ngHotReload_exports__';
  const ANGULAR_PACKAGE_NAME = 'angular';

  const buildHotReloadTemplate = template(`
/* babel-plugin-ng-hot-reload */
const %%extractedExports%% = (function(__ngHotReloadLoaderAngularGlobal) {
  var ${INNER_EXPORT_VARIABLE};
  var angular = module.hot ? (function() {
    var loader = require(${JSON.stringify(corePath)});
    return loader.decorateAngular({
      angular: __ngHotReloadLoaderAngularGlobal,
      forceRefresh: ${JSON.stringify(forceRefresh)},
      preserveState: ${JSON.stringify(preserveState)}
    });
  })() : __ngHotReloadLoaderAngularGlobal;

  try {
    ${INNER_EXPORT_VARIABLE} = (function() {
      /* babel-plugin-ng-hot-reload end*/
      %%source%%
      /* babel-plugin-ng-hot-reload */
      %%exports%%
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
  return ${INNER_EXPORT_VARIABLE};
})(${requireAngular});
/* babel-plugin-ng-hot-reload end */
`);

  const visitor = {
    Program: {
      exit(path) {
        // Only apply the hot-module-replacement template when usage of angular
        // is detected
        if (registerAngularUse.has(path)) {
          // TODO: This doesn't work right now because we need to reapply all
          // the imports and exports which we have removed
          // return;
        }

        const {
          node: { body: sourceBody },
        } = path;

        // Apply all transformations
        // state.pathsToRemove.forEach((pathToRemove: any) => pathToRemove.remove());
        // state.pathsToReplace.forEach((replacer, pathToReplace) =>
        //   pathToReplace.replaceWith(replacer)
        // );

        // Adds a return statement to the inner wrapper function which
        // contains the exports from the module
        // Also adds an destructor to the outside of the wrapper to make the
        // exports from inside the wrapper avaiable in global scope
        //
        // export default Controller;
        // export const namedExport
        //
        // == becomes ==
        //
        // Appended to wrapped source:
        // --
        // return {
        //   __export_default: Controller,
        //   __export_namedExport: namedExport
        // }
        //
        // Added to outer wrapper:
        // --
        // const { __export_default, __export_namedExport } = (function() {...})();
        //
        // Appended to template:
        // --
        // export {
        //   __export_default as default,
        //  __export_namedExport as namedExport
        // };
        const moduleExports = [];
        const extractedExports = [];
        const topLevelExports = [];
        state.topLevelExports.forEach((value, key) => {
          const identifierKey = `${EXPORTS_PREFIX}${key}`;
          // Properties of the return statement
          moduleExports.push(t.objectProperty(t.identifier(identifierKey), value));
          // Properties for the outer const destrcutor
          extractedExports.push(
            t.objectProperty(t.identifier(identifierKey), t.identifier(identifierKey), false, true)
          );
          // Restore the topLevelexports
          topLevelExports.push(t.exportSpecifier(t.identifier(identifierKey), t.identifier(key)));
        });
        // Wrap the properties in return statement
        const exportsAsReturnStatement = t.returnStatement(t.objectExpression(moduleExports));

        // build the template
        const hotReloadTemplateAst = buildHotReloadTemplate({
          source: sourceBody,
          exports: exportsAsReturnStatement,
          extractedExports: t.objectPattern(extractedExports),
        });

        const finalBody = [
          ...state.topLevelImports.values(),
          hotReloadTemplateAst,
          topLevelExports.length > 0 ? t.exportNamedDeclaration(null, topLevelExports) : undefined,
        ].filter(Boolean);

        path.node.body = finalBody;
      },
    },

    ImportDeclaration(path) {
      const { node } = path;

      // Check if the import is angular
      if (node.source.value === ANGULAR_PACKAGE_NAME) {
        const parentProgram = path.findParent(path => path.isProgram());
        registerAngularUse.set(parentProgram, true);
      }

      // Add import to the list and remove it for now
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
  };

  // When angular is used as global variable check for usage of the identifier
  if (angularGlobal) {
    visitor['Identifier'] = function(path) {
      const { node } = path;
      if (node.name === angularGlobal) {
        const parentProgram = path.findParent(path => path.isProgram());
        registerAngularUse.set(parentProgram, true);
      }
    };
  }

  return {
    name: 'ng-hot-reload',
    post() {
      // Clear the storage after each file
      state.topLevelImports.clear();
      state.topLevelExports.clear();
      state.pathsToRemove.clear();
      state.pathsToReplace.clear();
    },
    visitor,
  };
}
