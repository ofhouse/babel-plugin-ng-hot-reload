/**
 * This is the parent state for the entire application
 */

import { Ng1StateDeclaration } from '@uirouter/angularjs';

import { AppComponentName } from './app.component';
import { HomeViewComponentName } from '../home/home.component';

export const appState: Ng1StateDeclaration = {
  name: 'app',
  redirectTo: 'home',
  component: AppComponentName,
};

export const homeState: Ng1StateDeclaration = {
  parent: 'app',
  name: 'home',
  url: '/home',
  component: HomeViewComponentName,
};

export const infoFutureState: Ng1StateDeclaration = {
  parent: 'app',
  // The `.**` here is nothhing special we just make sure that it doesn't use
  // the same name as the lazy loaded state
  name: 'info.**',
  url: '/info',
  lazyLoad: async transition => {
    const $ocLazyLoad = transition.injector().get('$ocLazyLoad');
    const lazyModule = await import('../info/info.module');
    return $ocLazyLoad.load(lazyModule.InfoViewModule);
  },
};
