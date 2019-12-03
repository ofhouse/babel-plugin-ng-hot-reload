import * as angular from 'angular';
import { StateProvider } from '@uirouter/angularjs';

import { InfoViewComponentName, InfoViewComponent } from './info.component';
import { infoViewState } from './info.states';

export const InfoViewModule = angular
  .module('hotReloadDemo.view.info', [])
  .component(InfoViewComponentName, InfoViewComponent)
  .config(($stateProvider: StateProvider) => {
    'ngInject';

    // Adds subStates
    $stateProvider.state(infoViewState);
  });
