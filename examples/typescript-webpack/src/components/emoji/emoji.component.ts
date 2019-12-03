import { IOnInit } from 'angular';

class EmojiComponentController implements IOnInit {
  emoji?: string;
  icon = '🏠';

  $onInit() {
    if (this.emoji) {
      this.icon = this.emoji;
    }
  }
}

export const EmojiComponent = {
  controller: EmojiComponentController,
  template: `<span ng-bind="$ctrl.icon"></span>`,
  bindings: {
    emoji: '@',
  },
};

export const EmojiComponentName = 'emoji';
