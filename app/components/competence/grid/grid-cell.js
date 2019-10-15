import Component from '@ember/component';
import {computed} from '@ember/object';
import {inject as service} from '@ember/service';
import DS from 'ember-data';

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
      const templateLoaded = this.get('skill.productionTemplate.isFulfilled');
      if (!templateLoaded) {
        return false;
      }
      const view = this.get('view');
      return DS.PromiseObject.create({
        promise:this.get('skill.productionTemplate').then(productionTemplate => {
          if ((view === 'production' && productionTemplate)
            || (view === 'workbench')
            || (view === 'skills')
            || (view === 'quality' && productionTemplate) ) {
            return true;
          }
        })

      })
    }
    return false;
  })

});
