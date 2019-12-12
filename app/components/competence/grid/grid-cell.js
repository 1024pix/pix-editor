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
  mayAddSkill: computed('section', 'config.access', function () {
    return this.get('section') === 'skills' && this.get('access').mayEditSkills();
  }),

  displaySkill: computed('skill','skill.{productionTemplate,productionTemplate.isFulfilled}','hasStatusProduction','section', 'view', function () {
    const skill = this.get('skill');
    if(skill){
      const section = this.get('section');
      const view = this.get('view');
      const productionTemplate = this.get('skill.productionTemplate');
      switch(section) {
        case 'challenges':
          return ((view === 'production' && productionTemplate)
          || (view === 'workbench'));
        case 'quality':
          return (productionTemplate != null);
        case 'skills':
        default:
          return true;
      }
    }
    return false;
  })

});
