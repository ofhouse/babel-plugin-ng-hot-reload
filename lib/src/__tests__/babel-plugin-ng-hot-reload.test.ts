import { transform as babelTransform } from '@babel/core';
import { wrap } from 'jest-snapshot-serializer-raw';

import ngHotReloadPlugin from '../index';

function transform(input, options = {}) {
  return wrap(
    babelTransform(input, {
      babelrc: false,
      configFile: false,
      plugins: [ngHotReloadPlugin],
    }).code
  );
}

describe('ngHotReloadPlugin', () => {
  test('default export identifier', () => {
    expect(
      transform(`
      import * as angular from 'angular';

      const foo = 'bar';
      export default foo;
    `)
    ).toMatchSnapshot();
  });

  test('default export member expression', () => {
    expect(
      transform(`
      import * as angular from 'angular';

      const obj = {
        foo: 'bar'
      };
      export default obj.foo;
    `)
    ).toMatchSnapshot();
  });

  test('default export class', () => {
    expect(
      transform(`
      import * as angular from 'angular';

      export default class Test {
        constructor() {}
      }
    `)
    ).toMatchSnapshot();
  });

  test('named export class declaration', () => {
    expect(
      transform(`
      import * as angular from 'angular';

      export class Foo {};
    `)
    ).toMatchSnapshot();
  });

  test('named export variable declaration', () => {
    expect(
      transform(`
      import * as angular from 'angular';

      export const foo = 'bar',
                   bar = 'foo';
    `)
    ).toMatchSnapshot();
  });

  test('named exports', () => {
    expect(
      transform(`
      import * as angular from 'angular';

      const foo = 'bar';
      const bar = 'foo';
      export { foo, bar as bar2, foo as default };
    `)
    ).toMatchSnapshot();
  });

  test('Named export with source', () => {
    expect(
      transform(`
      import * as angular from 'angular';

      export { foo } from 'bar';
    `)
    ).toMatchSnapshot();
  });

  test('ExportAllDeclaration', () => {
    expect(
      transform(`
      import * as angular from 'angular';

      export * from 'foo';
    `)
    ).toMatchSnapshot();
  });

  test('No code transformation should be done when no angular reference is present', () => {
    expect(
      transform(`
      const foo = 'bar';
      const bar = 'foo';
      export { foo, bar as bar2, foo as default };
    `)
    ).toMatchSnapshot();
  });
});
