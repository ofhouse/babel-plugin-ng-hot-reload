import * as angular from 'angular';

import template from './app.template.html';
import './app.css';

class AppController {}

export const AppComponent: angular.IComponentOptions = {
  controller: AppController,
  controllerAs: 'vm',
  template,
};

export const AppComponentName = 'viewApp';
