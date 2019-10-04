import Component from '@ember/component';
import {computed} from '@ember/object';
import {inject as service} from '@ember/service';


export default Component.extend({

  // Element
  tagName: 'tr',
  classNames: ['competence-grid-row'],
  access: service(),
  config: service(),

  // Props
  tube: null,
  view: null,
  hasStatusProduction: false,

  // Computed
  mayAddSkill: computed("config.access", function () {
    return this.get("access").mayEditSkills();
  }),
   filteredSkills: computed('tube.@each.filledSkills', async function () {
    const skills = await this.get('tube.filledSkills');
    if (skills) {
      return skills.map(maybeSkill => {
        if (maybeSkill) {

          if ((this.get('view') === 'challenges') && this.get('hasStatusProduction') && maybeSkill.productionTemplate) {
            return maybeSkill;
          }
          if ((this.get('view') === 'challenges') && !this.get('hasStatusProduction')) {
            return maybeSkill;
          }
          if(this.get('view') === 'skills'){
            return maybeSkill
          }
          if((this.get('view') === 'quality') && maybeSkill.productionTemplate) {
            return maybeSkill
          }
        }
        return false;
      })
    }
  }),

});
