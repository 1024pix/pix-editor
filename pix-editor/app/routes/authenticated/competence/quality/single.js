import SkillRoute from '../skills/single';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class SingleRoute extends SkillRoute {
  templateName = 'authenticated/competence/skills/single';

  @service currentData;
  @service router;

  setupController() {
    super.setupController(...arguments);
    const competenceController = this.controllerFor('authenticated.competence');
    competenceController.setSection('quality');
    competenceController.setView(null);
  }

  @action
  willTransition(transition) {
    if (this.controllerFor('authenticated.competence.quality.single').edition &&
        !confirm('Êtes-vous sûr de vouloir abandonner la modification en cours ?')) {
      transition.abort();
    } else {
      this.controllerFor('authenticated.competence.quality.single').model.rollbackAttributes();
      if (transition.targetName === 'authenticated.competence.prototypes.index') {
        const skill = this.controllerFor('authenticated.competence.quality.single').skill;
        const prototype = skill.productionPrototype;
        if (prototype) {
          return this.router.transitionTo('authenticated.competence.prototypes.single', this.currentData.getCompetence(), prototype);
        }
      } else if (transition.targetName === 'authenticated.competence.skills.index') {
        return this.router.transitionTo('authenticated.competence.skills.single', this.currentData.getCompetence(), this.controllerFor('authenticated.competence.quality.single').model);
      }
      return true;
    }
  }
}
