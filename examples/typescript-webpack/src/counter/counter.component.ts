import template from './counter.html';

class CounterController {
  counter = 10;

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
