import DS from 'ember-data';
import {computed} from '@ember/object';

export default DS.Model.extend({
  name: DS.attr(),
  description: DS.attr(),
  competenceIds: DS.attr(),
  selectedLevel:false,
  skills:DS.hasMany('skill'),
  skillCount:computed('skills', function() {
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
  filledSkills:computed('sortedSkills', function() {
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
    return this.hasMany('skills').reload()
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
