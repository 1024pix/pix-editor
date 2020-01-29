import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/template';

export default Component.extend({
  classNames:['field'],
  safeHelpContent:computed('helpContent', function() {
    return htmlSafe(this.get('helpContent'));
  }),
  init() {
    this._super(...arguments);
    this.simpleMDEOptions = {
      status:false,
      spellChecker:false,
      hideIcons: ["heading", "image", "guide", "side-by-side"]
    };
  }
});
