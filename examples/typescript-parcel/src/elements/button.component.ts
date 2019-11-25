class ButtonComponentController {}

export const ButtonComponent = {
  controller: ButtonComponentController,
  template: `
    <button type="button">{{$ctrl.label}}!</button>
  `,
  bindings: {
    label: '@',
  },
};

export const ButtonComponentName = 'elementButton';
