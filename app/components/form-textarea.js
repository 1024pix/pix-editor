import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/template';

export default Component.extend({
  classNames:['field', 'textArea'],
  classNameBindings:['maximized'],
  maximized:false,
  safeHelpContent:computed('helpContent', function() {
    return htmlSafe(this.get('helpContent'));
  }),
  actions:{
    toggleMaximized() {
      this.set('maximized', !this.get('maximized'));
    }
  }

});
