/**
 * Contains all substates of /info** route
 */

import { Ng1StateDeclaration } from '@uirouter/angularjs';
import { InfoViewComponentName } from './info.component';

// Main state
export const infoViewState: Ng1StateDeclaration = {
  parent: 'app',
  name: 'info',
  url: '/info',
  component: InfoViewComponentName,
};
