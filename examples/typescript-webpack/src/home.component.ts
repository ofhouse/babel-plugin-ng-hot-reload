import { HomeController } from './home.controller';
import template from './home.view.html';

export const HomeViewComponent = {
  controller: HomeController,
  controllerAs: 'vm',
  template,
};
export const HomeViewComponentName = 'view.home';
