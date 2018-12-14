import DS from 'ember-data';
import {computed} from '@ember/object';


export default DS.Model.extend({
  needsRefresh:false,
  area: DS.belongsTo('area'),
  name: DS.attr('string', { readOnly: true }),
  code: DS.attr(),
  rawTubes: DS.hasMany('tube'),
  tubes:computed('rawTubes', function() {
    return DS.PromiseArray.create({
      promise:this.get('rawTubes')
        .then(tubes => {
          return tubes.filter(tube => {
            return tube.get('name') !== '@workbench';
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
  loaded:computed('tubes.[]', function() {
    return this.get('tubes')
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
    return this.get('tubes').length;
  }),
  skillCount:computed('tubes.[]', function() {
    return DS.PromiseObject.create({
      promise:this.get('tubes')
        .then(tubes => {
          let getCounts = tubes.reduce((promises, tube) => {
            promises.push(tube.get('skillCount'));
            return promises;
          }, []);
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
          return workbenchTube.get('skills');
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
          })
        })
    });
  }),
  refresh() {
    return this.hasMany('tubes').reload()
    .then(tubes => {
      let refreshTubes = tubes.reduce((promises, tube) => {
        promises.push(tube.refresh());
        return promises;
      }, []);
      return Promise.all(refreshTubes);
    });
  }
});
