import Component from '@ember/component';

export default Component.extend({
  name:null,
  label:null,
  disabled:false,
  init() {
    this._super(...arguments);
    this.ignorableAttrs = ['checked', 'label', 'disabled'];
  }
});
