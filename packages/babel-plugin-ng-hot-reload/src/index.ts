/**
 * Note: Please make sure to only use syntax which is compatible with IE11 here
 *       because the transformation runs after @babel/env!
 */

import * as Babel from '@babel/core';

type BabelT = typeof Babel;
type PluginOptions = {
  angularGlobal: false | string;
  forceRefresh: boolean;
  preserveState: boolean;
  angularReference: string;
};

export default function(
  babel: BabelT,
  {
    angularGlobal = false,
    forceRefresh = true,
    preserveState = true,
    angularReference = `require('angular'), angular`,
  }: PluginOptions
) {
  const { types: t, template } = babel;

  let state = {
    topLevelImports: new Set(),
    topLevelExports: new Map(),
    topLevelExportModule: new Set(),
    pathsToRemove: new Set(),
    pathsToReplace: new Map(),
  };
  const registerAngularUse = new Map();

  const corePath = 'ng-hot-reload-core';
  const EXPORTS_PREFIX = '__ngHotReload_';
  const OUTER_EXPORT_VARIABLE = '__ngHotReload_outer_exports__';
  const INNER_EXPORT_VARIABLE = '__ngHotReload_inner_exports__';
  const ANGULAR_PACKAGE_NAME = 'angular';

  const buildHotReloadTemplate = template(`
/* babel-plugin-ng-hot-reload */
var ${OUTER_EXPORT_VARIABLE} = (function(__ngHotReloadLoaderAngularGlobal) {
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
})(${angularReference});
/* babel-plugin-ng-hot-reload end */
`);

  const visitor = {
    Program: {
      exit(path) {
        // Only apply the hot-module-replacement template when usage of angular
        // is detected
        if (!registerAngularUse.has(path)) {
          return;
        }

        const {
          node: { body: sourceBody },
        } = path;

        // Apply all transformations
        state.pathsToRemove.forEach((pathToRemove: any) => pathToRemove.remove());
        state.pathsToReplace.forEach((replacer, pathToReplace) =>
          pathToReplace.replaceWith(replacer)
        );

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
        // var OUTER_EXPORT_VARIABLE = (function() {...})();
        //
        // Appended to template:
        // --
        // var __export_default = OUTER_EXPORT_VARIABLE.__export_default,
        //     __export_namedExport = OUTER_EXPORT_VARIABLE.__export_namedExport;
        //
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
            t.variableDeclarator(
              t.identifier(identifierKey),
              t.memberExpression(t.identifier(OUTER_EXPORT_VARIABLE), t.identifier(identifierKey))
            )
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
        });

        const finalBody = [
          ...state.topLevelImports.values(),
          hotReloadTemplateAst,
          extractedExports.length > 0 ? t.variableDeclaration('var', extractedExports) : undefined,
          topLevelExports.length > 0 ? t.exportNamedDeclaration(null, topLevelExports) : undefined,
          ...state.topLevelExportModule.values(),
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
      state.pathsToRemove.add(path);
    },

    ExportNamedDeclaration(path) {
      // Check if we have an export from a source
      // e.g:
      // export { foo } from 'bar';
      if (path.node.source) {
        // Same behaviour as ExportAllDeclaration
        state.topLevelExportModule.add(path.node);
        state.pathsToRemove.add(path);
        return;
      }

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
        state.pathsToReplace.set(path, declaration);
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
        state.pathsToRemove.add(path);
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
        state.pathsToRemove.add(path);
      } else {
        // If we have a declaration in the default export we have to get the
        // identifier through the `id` property
        // e.g:
        // export default class Foo {}
        state.topLevelExports.set('default', declaration.get('id').node);
        // Replace the export declaration with the actual declaration
        state.pathsToReplace.set(path, declaration);
      }
    },

    ExportAllDeclaration(path) {
      // ExportAllDeclarations can be safely removed and later reapplied
      state.topLevelExportModule.add(path.node);
      state.pathsToRemove.add(path);
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
      state.topLevelExportModule.clear();
      state.pathsToRemove.clear();
      state.pathsToReplace.clear();
    },
    visitor,
  };
}
