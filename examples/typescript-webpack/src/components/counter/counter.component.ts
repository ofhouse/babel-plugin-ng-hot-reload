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

export const CounterComponent = {
  controller: CounterController,
  template,
};

export const CounterComponentName = 'counter';
