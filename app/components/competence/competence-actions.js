import Component from '@ember/component';
import {computed} from "@ember/object";
import {inject as service} from '@ember/service';

export default Component.extend({
  classNames:['ui', 'top', 'attached', 'borderless', 'labelled', 'icon', 'menu'],
  classNameBindings:['hiddenClass', 'skillCkass'],
  config: service(),
  hiddenClass:computed('hidden', function() {
    return this.get('hidden')?'hidden':'';
  }),
  skillClass:computed('view', function() {
    return (this.get('view')==='skills')?'skill-mode':'';
  })
});
