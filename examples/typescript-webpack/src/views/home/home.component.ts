import { HomeController } from './home.controller';
import template from './home.template.html';

export const HomeViewComponent = {
  controller: HomeController,
  controllerAs: 'vm',
  template,
};

export const HomeViewComponentName = 'viewHome';
