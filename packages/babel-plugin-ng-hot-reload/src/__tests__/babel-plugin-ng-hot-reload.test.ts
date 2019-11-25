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
      const foo = 'bar';
      export default foo;
    `)
    ).toMatchSnapshot();
  });

  test('default export member expression', () => {
    expect(
      transform(`
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
      export default class Test {
        constructor() {}
      }
    `)
    ).toMatchSnapshot();
  });

  test('named export class declaration', () => {
    expect(
      transform(`
      export class Foo {};
    `)
    ).toMatchSnapshot();
  });

  test('named export variable declaration', () => {
    expect(
      transform(`
      export const foo = 'bar',
                   bar = 'foo';
    `)
    ).toMatchSnapshot();
  });

  test('named exports', () => {
    expect(
      transform(`
      const foo = 'bar';
      const bar = 'foo';
      export { foo, bar as bar2, foo as default };
    `)
    ).toMatchSnapshot();
  });
});