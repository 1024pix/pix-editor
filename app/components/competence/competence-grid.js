import Component from '@ember/component';
import {computed} from "@ember/object";

export default Component.extend({
  classNames: ['competence-grid'],
  classNameBindings: ['hiddenClass'],
  hiddenClass:computed('hidden', function() {
    return this.get('hidden')?'hidden':'';
  }),
  displayAllTubes:computed('section', 'view', function() {
    return this.get('section') === 'skills' || this.get('view') === 'workbench';
  })
});
