import { StateProvider } from '@uirouter/angularjs';

import homeTemplate from './home.view.html';
import { HomeController } from './home.controller';

export function appRouter($stateProvider: StateProvider) {
  'ngInject';
  $stateProvider.state('home', {
    url: '',
    template: homeTemplate,
    controller: HomeController,
    controllerAs: 'vm',
  });
}
