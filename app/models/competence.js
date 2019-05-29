import DS from 'ember-data';
import {computed} from '@ember/object';


export default DS.Model.extend({
  needsRefresh:false,
  name: DS.attr('string', { readOnly: true }),
  code: DS.attr(),
  rawTubes: DS.hasMany('tube'),
  tubes:computed('rawTubes.[]', function() {
    return DS.PromiseArray.create({
      promise:this.get('rawTubes')
        .then(tubes => {
          return tubes.filter(tube => {
            return tube.get('name') !== '@workbench';
          });
        })
    });
  }),
  productionTubes:computed('rawTubes.[]', function() {
    let allTubes;
    return DS.PromiseArray.create({
      promise:this.get('tubes')
        .then(tubes => {
          allTubes = tubes;
          const testProduction = tubes.map(tube => tube.get('hasProductionChallenge'));
          return Promise.all(testProduction);
        })
        .then(tests => {
          return allTubes.filter((tube, index) => {
            return tests[index];
          });
        })
    });
  }),
  sortedTubes:computed('tubes.[]', function() {
    return DS.PromiseArray.create({
      promise:this.get('tubes')
        .then(tubes => {
          return tubes.filterBy('name');
        })
    });
  }),
  loaded:computed('rawTubes.[]', function() {
    return this.get('rawTubes')
    .then(tubes => {
      let waitForTubes = tubes.reduce((promises, tube) => {
        promises.push(tube.get('loaded'));
        return promises;
      }, []);
      return Promise.all(waitForTubes);
    })
    .then(() => {
      return true;
    })
  }),
  tubeCount:computed('tubes', function() {
    return DS.PromiseObject.create({
      promise:this.get('tubes')
        .then(tubes => tubes.length)
    });
  }),
  productionTubeCount:computed('tubes', function() {
    return DS.PromiseObject.create({
      promise:this.get('productionTubes')
        .then(tubes => tubes.length)
    });
  }),
  skillCount:computed('tubes.@each.skillCount', function() {
    return DS.PromiseObject.create({
      promise:this.get('tubes')
        .then(tubes => {
          const getCounts = tubes.map(tube => tube.get('skillCount'));
          return Promise.all(getCounts);
        })
        .then(counts => {
          return counts.reduce((count, value)=> {
            return count+value;
          },0);
        })
    });
  }),
  productionSkillCount:computed('tubes.@each.productionSkillCount', function() {
    return DS.PromiseObject.create({
      promise:this.get('tubes')
        .then(tubes => {
          const getCounts = tubes.map(tube => tube.get('productionSkillCount'));
          return Promise.all(getCounts);
        })
        .then(counts => {
          return counts.reduce((count, value)=> {
            return count+value;
          },0);
        })
    });
  }),
  workbenchSkill:computed('rawTubes', function() {
    return DS.PromiseObject.create({
      promise:this.get('rawTubes')
        .then(tubes => {
          return tubes.find(tube => {
            return tube.get('name') === '@workbench';
          })
        })
        .then(workbenchTube => {
          return workbenchTube.get('rawSkills');
        })
        .then(workbenchSkills => {
          return workbenchSkills.get('firstObject');
        })
    });
  }),
  workbenchTemplates:computed('workbenchSkill', 'workbenchSkill.templates.{[],@each.status}', function() {
    return DS.PromiseArray.create({
      promise:this.get('workbenchSkill')
        .then(skill => {
          return skill.get('templates');
        })
        .then(templates => {
          return templates.filter(template => {
            return !template.get('isArchived');
          });
        })
    });
  }),
  refresh() {
    return this.hasMany('rawTubes').reload()
    .then(tubes => {
      let refreshTubes = tubes.reduce((promises, tube) => {
        promises.push(tube.refresh());
        return promises;
      }, []);
      return Promise.all(refreshTubes);
    });
  }
});
