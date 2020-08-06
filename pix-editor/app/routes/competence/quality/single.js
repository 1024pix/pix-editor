import SkillRoute from '../skills/single';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class SingleRoute extends SkillRoute {
  templateName = 'competence/skills/single';

  @service currentData;

  setupController() {
    super.setupController(...arguments);
    const competenceController = this.controllerFor('competence');
    competenceController.setSection('quality');
    competenceController.setView(null);
  }

  @action
  willTransition(transition) {
    if (this.controller.edition &&
        !confirm('Êtes-vous sûr de vouloir abandonner la modification en cours ?')) {
      transition.abort();
    } else {
      this.controller.model.rollbackAttributes();
      if (transition.targetName === 'competence.prototypes.index') {
        const skill = this.controller.skill;
        const prototype = skill.productionPrototype;
        if (prototype) {
          return this.transitionTo('competence.prototypes.single', this.currentData.getCompetence(), prototype);
        }
      } else if (transition.targetName === 'competence.skills.index') {
        return this.transitionTo('competence.skills.single', this.currentData.getCompetence(), this.controller.model);
      }
      return true;
    }
  }
}
