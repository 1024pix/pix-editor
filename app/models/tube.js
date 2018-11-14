import DS from 'ember-data';
import {computed} from '@ember/object';
import {sort} from '@ember/object/computed';

export default DS.Model.extend({
  name: DS.attr(),
  description: DS.attr(),
  competenceIds: DS.attr(),
  selectedLevel:false,
  rawSkills:DS.hasMany('skill'),
  skills:computed('rawSkills', function() {
    return DS.PromiseArray.create({
      promise:this.get('rawSkills')
        .then(skills => {
          return skills.filter(skill => {
            return skill.get('status') === 'actif';
          });
        })
    });
  }),
  skillsSorting:Object.freeze(['level']),
  sortedSkills:sort('skills', 'skillsSorting'),
  init() {
    this.set('selectedSkills', []);
    return this._super(...arguments);
  }
});
