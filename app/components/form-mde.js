import Component from '@ember/component';

export default Component.extend({
  classNames:['field'],
  init() {
    this._super(...arguments);
    this.simpleMDEOptions = {
      status:false,
      spellChecker:false,
      hideIcons: ["heading", "image", "guide", "side-by-side"]
    };
  }
});
