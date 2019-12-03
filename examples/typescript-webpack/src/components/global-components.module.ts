/**
 * All components defined here are globally available to all submodules
 */

import * as angular from 'angular';
import * as ngAnimate from 'angular-animate';

import { EmojiComponent, EmojiComponentName } from './emoji/emoji.component';
import { CounterComponentName, CounterComponent } from './counter/counter.component';
import { helloDirective, helloDirectiveName } from '../directives/hello/hello.directive';
import { ButtonComponentName, ButtonComponent } from './button/button.component';
import { DateComponentName, DateComponent } from './date/date.component';
import { FadeComponent, FadeComponentName } from './fade/fade.component';

export const globalComponentsModule = angular.module('hotReloadDemo.components', [ngAnimate]);

// Components
globalComponentsModule.component(ButtonComponentName, ButtonComponent);
globalComponentsModule.component(CounterComponentName, CounterComponent);
globalComponentsModule.component(DateComponentName, DateComponent);
globalComponentsModule.component(EmojiComponentName, EmojiComponent);
globalComponentsModule.component(FadeComponentName, FadeComponent);

// Directives
globalComponentsModule.directive(helloDirectiveName, helloDirective);
