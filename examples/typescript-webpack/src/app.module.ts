import * as angular from 'angular';
import * as ngAnimate from 'angular-animate';
import uiRouter from '@uirouter/angularjs';

import elementsModule from './elements.module';
import { HomeViewComponentName, HomeViewComponent } from './home.component';
import { appRouter } from './routes';

angular
  .module('hot-reload-demo', [uiRouter, ngAnimate, elementsModule])
  .component(HomeViewComponentName, HomeViewComponent)
  .config(appRouter);
