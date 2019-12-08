import * as angular from 'angular';
import { StateProvider, UIRouter } from '@uirouter/angularjs';

import { appState, homeState, infoFutureState } from './views/app/app.states';
import { AppComponent, AppComponentName } from './views/app/app.component';
import { HomeViewComponent, HomeViewComponentName } from './views/home/home.component';
import { globalComponentsModule } from './components/global-components.module';

export const mainModule = angular.module('hotReloadDemo.main', [globalComponentsModule.name]);

// Register the main states of the application
mainModule.config(
  (
    $locationProvider: angular.ILocationProvider,
    $uiRouterProvider: UIRouter,
    $stateProvider: StateProvider
  ) => {
    'ngInject';
    const { urlService } = $uiRouterProvider;

    // Do not use hashbang routing when history is avaiable
    // https://stackoverflow.com/a/4710239/831465
    if (window.history && window.history.pushState) {
      // TODO: Does not work on CodeSandbox
      // $locationProvider.html5Mode(true);
    }

    // If the user enters a URL that doesn't match any known URL (state),
    // send them to`/home`
    urlService.rules.otherwise({ state: 'home' });

    $stateProvider.state(appState);
    $stateProvider.state(homeState);
    $stateProvider.state(infoFutureState);
  }
);

// Register the view components
mainModule.component(AppComponentName, AppComponent);
mainModule.component(HomeViewComponentName, HomeViewComponent);
