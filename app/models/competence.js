import DS from 'ember-data';
import {computed} from '@ember/object';


export default DS.Model.extend({
  needsRefresh:false,
  area: DS.belongsTo("area"),
  name: DS.attr("string", { readOnly: true }),
  code: DS.attr(),
  tubes: DS.hasMany("tube"),
  sortedTubes:computed('tubes.[]', function() {
    return DS.PromiseArray.create({
      promise:this.get('tubes')
        .then(tubes => {
          return tubes.filterBy('name');
        })
    });
  }),
  loaded:computed("tubes.[]", function() {
    return this.get("tubes")
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
  tubeCount:computed("tubes", function() {
    return this.get("tubes").length;
  }),
  skillCount:computed("tubes.[]", function() {
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
