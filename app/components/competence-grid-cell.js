import Component from '@ember/component';
import {computed} from '@ember/object';
import {inject as service} from '@ember/service';


export default Component.extend({

  // Element
  tagName:"",
  access: service(),
  config: service(),

  // Props
  skill: null,
  view: null,
  productionTemplate: null,
  hasStatusProduction: false,

  // Computed
  mayAddSkill: computed("config.access", function () {
    return this.get("access").mayEditSkills();
  }),

  filteredSkill: computed('skill','skill.productionTemplate','view', function () {
    const skill = this.get('skill');
    const productionTemplate = this.get('skill.productionTemplate');
    const view = this.get('view');
    if(skill){
      if ((view === 'challenges') && this.get('hasStatusProduction') && productionTemplate) {
        return skill;
      }
      if ((view === 'challenges') && !this.get('hasStatusProduction')) {
        return skill;
      }
      if(view === 'skills'){
        return skill;
      }
      if((view === 'quality') && productionTemplate) {
        return skill;
      }
    }
    return false;
  })

});
