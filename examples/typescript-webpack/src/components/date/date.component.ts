class DateComponentController {}

export const DateComponent = {
  controller: DateComponentController,
  template: `
    <label>
    {{$ctrl.label}}
    <input type="date" />
    </label>
  `,
  bindings: {
    label: '@',
  },
};

export const DateComponentName = 'elementDate';
