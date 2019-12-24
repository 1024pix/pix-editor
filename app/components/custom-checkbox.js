import Component from '@ember/component';

export default Component.extend({
  name:null,
  label:null,
  disabled:false,
  ignorableAttrs: ['checked', 'label', 'disabled'],
});
