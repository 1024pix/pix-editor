import DS from 'ember-data';
import {computed} from '@ember/object';


export default DS.Model.extend({
  needsRefresh:false,
  name: DS.attr('string', { readOnly: true }),
  title:DS.attr(),
  code: DS.attr(),
  description:DS.attr(),
  rawTubes: DS.hasMany('tube'),
  tubes:computed('rawTubes.[]', function() {
    return this.get('rawTubes').filter(tube => {
      return tube.get('name') !== '@workbench';
    });
  }),
  productionTubes:computed('rawTubes.[]', function() {
    let allTubes = this.get('rawTubes');
    allTubes = allTubes.filter(tube => tube.get('hasProductionChallenge'));
    return allTubes.sortBy('name');
  }),
  sortedTubes:computed('tubes.[]', function() {
    return this.get('tubes').sortBy('name');
  }),
  tubeCount:computed('tubes', function() {
    return this.get('tubes').length;
  }),
  productionTubeCount:computed('productionTubes', function() {
    return this.get('productionTubes').length;
  }),
  selectedProductionTubeCount:computed('productionTubes.@each.selectedLevel', function(){
    return this.get('productionTubes').filter(tube => tube.get('selectedLevel')).length;
  }),
  skillCount:computed('tubes.@each.skillCount', function() {
    return this.get('tubes').map(tube => tube.get('skillCount')).reduce((count, value)=> {
      return count+value;
    },0);
  }),
  productionSkillCount:computed('tubes.@each.productionSkillCount', function() {
    return this.get('tubes').map(tube => tube.get('productionSkillCount')).reduce((count, value)=> {
      return count+value;
    },0);
  }),
  workbenchSkill:computed('rawTubes', function() {
    const workbenchTube = this.get('rawTubes').find(tube => {
      return tube.get('name') === '@workbench';
    });
    if (workbenchTube) {
      return workbenchTube.get('rawSkills').get('firstObject');
    }
    return null;
  }),
  workbenchTemplates:computed('workbenchSkill', 'workbenchSkill.templates.{[],@each.status}', function() {
    const workbenchSkill = this.get('workbenchSkill');
    if (workbenchSkill)
    return workbenchSkill.get('templates').filter(template => {
      return !template.get('isArchived');
    });
    return [];
  })
});
