import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import SkillRoute from '../skills/single';

@classic
export default class SingleRoute extends SkillRoute {
  templateName = 'competence/skills/single';

  setupController() {
    super.setupController(...arguments);
    const competenceController = this.controllerFor('competence');
    competenceController.set('section', 'quality');
  }

  @action
  willTransition(transition) {
    if (this.controller.get('edition') &&
        !confirm('Êtes-vous sûr de vouloir abandonner la modification en cours ?')) {
      transition.abort();
    } else {
      this.controller.get('model').rollbackAttributes();
      if (transition.targetName === 'competence.templates.index') {
        const skill = this.controller.get('skill');
        const template = skill.get('productionTemplate');
        if (template) {
          return this.transitionTo('competence.templates.single', this.controller.get('competence'), template);
        }
      } else if (transition.targetName === 'competence.skills.index') {
        return this.transitionTo('competence.skills.single', this.controller.get('competence'), this.controller.get('skill'));
      }
      return true;
    }
  }
}
