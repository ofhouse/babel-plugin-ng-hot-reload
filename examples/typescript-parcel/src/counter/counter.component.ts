import template from './counter.html';

class CounterController {
  counter = 12;

  add() {
    this.counter++;
  }

  sub() {
    this.counter--;
  }
}

angular.module('hot-reload-demo').component('counter', {
  controller: CounterController,
  template,
});
