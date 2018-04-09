import Component from '@ember/component';

export default Component.extend({
  classNames:['field', 'textArea'],
  classNameBindings:['maximized'],
  maximized:false,
  actions:{
    toggleMaximized() {
      this.set("maximized", !this.get("maximized"));
    }
  }

});
