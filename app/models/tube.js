import DS from 'ember-data';
import {computed} from '@ember/object';

export default DS.Model.extend({
  name: DS.attr(),
  title: DS.attr(),
  description: DS.attr(),
  practicalTitle: DS.attr(),
  practicalDescription: DS.attr(),
  competence: DS.belongsTo('competence'),
  selectedLevel:false,
  rawSkills:DS.hasMany('skill'),
  skills:computed('rawSkills.[]', function() {
    return DS.PromiseArray.create({
      promise:this.get('rawSkills')
        .then(skills => {
          return skills.filter(skill => {
            return skill.get('status') !== 'périmé';
          });
        })
    });
  }),
  skillCount:computed('skills.[]', function() {
    return this.get('skills').length;
  }),
  productionSkills:computed('skills.@each.productionTemplate', function() {
    return DS.PromiseArray.create({
      promise:this.get('skills')
        .then(skills => {
          const checkProductionChallenges = skills.sortBy('level').map(skill => {
            return skill.get('productionTemplate')
              .then(template => {
                if (template != null) {
                  return skill;
                } else {
                  return null;
                }
              })
          });
          return Promise.all(checkProductionChallenges)
        })
        .then(skills => {
          return skills.filter(skill => skill !== null)
        })
    });
  }),
  productionSkillCount:computed('skills.@each.productionTemplate', function() {
    return DS.PromiseObject.create({
      promise:this.get('skills')
      .then(skills => {
        const getProductionChallenges = skills.map(skill => skill.get('productionTemplate'));
        return Promise.all(getProductionChallenges);
      })
      .then(productionChallenges => {
        return productionChallenges.filter(challenge => challenge != null).length;
      })
    })
  }),
  sortedSkills:computed('skills.[]', function() {
    return DS.PromiseArray.create({
      promise:this.get('skills')
      .then(skills => {
        return skills.sortBy('level');
      })
    });
  }),
  filledSkills:computed('sortedSkills.{[],@each.level}', function() {
    return DS.PromiseArray.create({
      promise:this.get('sortedSkills')
        .then(skills => {
          let value = skills.reduce((grid, skill) => {
            grid[skill.get('level')-1] = skill;
            return grid;
          },[false, false, false, false, false, false, false]);
          return value;
        })
    });
  }),
  hasProductionChallenge:computed('productionSkillCount', function() {
    return DS.PromiseObject.create({
      promise:this.get('productionSkillCount')
      .then(count => count > 0)
    })
  }),
  loaded:computed('skills.[]', function() {
    return this.get('skills')
    .then(skills => {
      let waitForSkills = skills.map(skill => skill.get('loaded'));
      return Promise.all(waitForSkills);
    })
    .then(() => {
      return true;
    });
  }),
  refresh() {
    return this.hasMany('rawSkills').reload()
    .then(skills => {
      const refreshSkills = skills.map(skill => skill.refresh());
      return Promise.all(refreshSkills);
    });
  },
  init() {
    this.set('selectedSkills', []);
    return this._super(...arguments);
  }
});
