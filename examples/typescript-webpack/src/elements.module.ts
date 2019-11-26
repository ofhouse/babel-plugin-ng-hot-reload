import * as angular from 'angular';

import { ButtonComponent, ButtonComponentName } from './elements/button.component';
import { DateComponent, DateComponentName } from './elements/date.component';

const ngMod = angular
  .module('elements', [])
  .component(ButtonComponentName, ButtonComponent)
  .component(DateComponentName, DateComponent);

export default ngMod.name;
