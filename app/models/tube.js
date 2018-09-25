import DS from 'ember-data';
import {sort} from '@ember/object/computed';

export default DS.Model.extend({
  name: DS.attr(),
  description: DS.attr(),
  competenceIds: DS.attr(),
  selectedLevel:false,
  skills:DS.hasMany('skill'),
  skillsSorting:Object.freeze(['level']),
  sortedSkills:sort('skills', 'skillsSorting'),
  init() {
    this.set('selectedSkills', []);
    return this._super(...arguments);
  }
});
