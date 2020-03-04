import SkillRoute from '../skills/single';
import { action } from '@ember/object';

export default class SingleRoute extends SkillRoute {
  templateName = 'competence/skills/single';

  setupController() {
    super.setupController(...arguments);
    const competenceController = this.controllerFor('competence');
    competenceController.set('section', 'quality');
  }

  @action
  willTransition(transition) {
    if (this.controller.edition &&
        !confirm('Êtes-vous sûr de vouloir abandonner la modification en cours ?')) {
      transition.abort();
    } else {
      this.controller.model.rollbackAttributes();
      if (transition.targetName === 'competence.templates.index') {
        const skill = this.controller.skill;
        const template = skill.productionTemplate;
        if (template) {
          return this.transitionTo('competence.templates.single', this.controller.competence, template);
        }
      } else if (transition.targetName === 'competence.skills.index') {
        return this.transitionTo('competence.skills.single', this.controller.competence, this.controller.skill);
      }
      return true;
    }
  }
}
