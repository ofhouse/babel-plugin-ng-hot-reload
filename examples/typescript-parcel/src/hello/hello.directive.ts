import template from './hello.html';
import { HelloController } from './hello.controller';

angular.module('hot-reload-demo').directive('hello', () => {
  return {
    template,
    scope: true,
    controller: HelloController,
    controllerAs: 'vm',
  };
});
