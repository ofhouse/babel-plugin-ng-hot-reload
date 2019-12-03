/**
 * Bootstraps the angular.js app
 * This is the entry point for our application
 */

import * as angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import oclazyload from 'oclazyload';

import { mainModule } from './main.module';

export const ngApp = angular.module('hotReloadDemo', [uiRouter, oclazyload, mainModule.name]);
