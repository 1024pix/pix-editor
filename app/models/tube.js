import DS from 'ember-data';
import {computed} from '@ember/object';

export default DS.Model.extend({
  name: DS.attr(),
  description: DS.attr(),
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
  hasProductionChallenge:computed('skills.@each.productionTemplate', function() {
    return DS.PromiseObject.create({
      promise:this.get('skills')
      .then(skills => {
        let getProductionChallenges = skills.reduce((requests, skill) => {
          requests.push(skill.get('productionTemplate'));
          return requests;
        }, []);
        return Promise.all(getProductionChallenges);
      })
      .then(productionChallenges => {
        let challengeCount = productionChallenges.reduce((count, challenge) => {
          if (challenge) {
            return count+1;
          }
          return count;
        },0);
        return challengeCount>0;
      })
    })
  }),
  loaded:computed('skills.[]', function() {
    return this.get('skills')
    .then(skills => {
      let waitForSkills = skills.reduce((promises, skill) => {
        promises.push(skill.get('loaded'));
        return promises;
      }, []);
      return Promise.all(waitForSkills);
    })
    .then(() => {
      return true;
    });
  }),
  refresh() {
    return this.hasMany('rawSkills').reload()
    .then(skills => {
      let refreshSkills = skills.reduce((promises, skill) => {
        promises.push(skill.refresh());
        return promises;
      }, []);
      return Promise.all(refreshSkills);
    });
  },
  init() {
    this.set('selectedSkills', []);
    return this._super(...arguments);
  }
});
