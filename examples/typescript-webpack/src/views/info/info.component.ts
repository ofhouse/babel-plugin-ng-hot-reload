import { IComponentOptions } from 'angular';

import { InfoViewController } from './info.controller';
import template from './info.template.html';

export const InfoViewComponent: IComponentOptions = {
  controller: InfoViewController,
  controllerAs: 'vm',
  template,
};

export const InfoViewComponentName = 'viewInfo';
