import Component from '@ember/component';
import {computed} from "@ember/object";

export default Component.extend({
  classNames: ['competence-grid'],
  classNameBindings: ['hiddenClass'],
  hiddenClass:computed('hidden', function() {
    return this.get('hidden')?'hidden':'';
  }),
  displayAllTubes:computed('view', function() {
    const view = this.get('view');
    return (view === 'skills' || view === 'workbench');
  })
});
