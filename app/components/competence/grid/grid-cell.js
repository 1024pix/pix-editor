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
  mayAddSkill: computed('view', 'config.access', function () {
    return this.get('view') === 'skills' && this.get('access').mayEditSkills();
  }),

  displaySkill: computed('skill','skill.{productionTemplate,productionTemplate.isFulfilled}','hasStatusProduction','view', function () {
    const skill = this.get('skill');
    if(skill){
      const view = this.get('view');
      const productionTemplate = this.get('skill.productionTemplate');
      if ((view === 'production' && productionTemplate)
        || (view === 'workbench')
        || (view === 'skills')
        || (view === 'quality' && productionTemplate) ) {
        return true;
      }
      return false;
    }
    return false;
  })

});
