import { StateProvider } from '@uirouter/angularjs';

import { HomeViewComponentName } from './home.component';

export function appRouter($stateProvider: StateProvider) {
  'ngInject';
  $stateProvider.state('home', {
    url: '',
    component: HomeViewComponentName,
  });
}
