import DS from 'ember-data';
import {computed} from '@ember/object';

const findTubeName = /^@([^\d]+)(\d)$/;


export default DS.Model.extend({
  init() {
    this._super(...arguments);
    this.skills = [];
  },
  area: DS.belongsTo('area'),
  name: DS.attr('string', { readOnly: true }),
  code: DS.attr(),
  tubes:computed('skills', function() {
    const skills = this.get('skills');
    let set = skills.reduce((current, skill) => {
      let result = findTubeName.exec(skill.get("name"));
      if (result && result[1] && result[2]) {
        let tubeName = result[1];
        let index = parseInt(result[2]);
        if (!current[tubeName]) {
          current[tubeName] = [false, false, false, false, false, false, false];
        }
        current[tubeName][index-1] = skill;
      }
      return current;
    }, {});
    return Object.keys(set).reduce((current, key) => {
      current.push({name:key, skills:set[key]});
      return current;
    }, []);
  })
});
