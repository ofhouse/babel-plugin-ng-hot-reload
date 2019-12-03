import template from './hello.html';
import { HelloController } from './hello.controller';

export const helloDirective = () => {
  return {
    template,
    scope: true,
    controller: HelloController,
    controllerAs: 'vm',
  };
};

export const helloDirectiveName = 'hello';
