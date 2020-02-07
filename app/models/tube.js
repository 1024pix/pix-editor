import DS from 'ember-data';
import {computed} from '@ember/object';

export default DS.Model.extend({
  name: DS.attr(),
  title: DS.attr(),
  description: DS.attr(),
  practicalTitle: DS.attr(),
  practicalDescription: DS.attr(),
  pixId: DS.attr(),
  competence: DS.belongsTo('competence'),
  selectedLevel:false,
  rawSkills:DS.hasMany('skill'),
  skills:computed('rawSkills.[]', function() {
    return this.get('rawSkills').filter(skill => {
      return skill.get('status') !== 'périmé';
    });
  }),
  skillCount:computed('skills.[]', function() {
    return this.get('skills').length;
  }),
  productionSkills:computed('sortedSkills.@each.productionTemplate', function() {
    return this.get('sortedSkills').filter(skill => skill.get('productionTemplate') != null);
  }),
  productionSkillCount:computed('skills.@each.productionTemplate', function() {
    return this.get('skills').map(skill => skill.get('productionTemplate')).filter(challenge => challenge != null).length;
  }),
  sortedSkills:computed('skills.[]', function() {
    return this.get('skills').sortBy('level');
  }),
  filledSkills:computed('sortedSkills.{[],@each.level}', function() {
    return this.get('sortedSkills').reduce((grid, skill) => {
        grid[skill.get('level')-1] = skill;
        return grid;
      },[false, false, false, false, false, false, false]);
  }),
  hasProductionChallenge:computed('productionSkillCount', function() {
    return this.get('productionSkillCount') > 0;
  }),
  init() {
    this.set('selectedSkills', []);
    return this._super(...arguments);
  }
});
