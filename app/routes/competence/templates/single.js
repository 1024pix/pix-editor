import classic from 'ember-classic-decorator';
import Route from '@ember/routing/route';
import { action } from '@ember/object';

@classic
export default class SingleRoute extends Route {

  model(params) {
    return this.get('store').findRecord('challenge', params.template_id);
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.set('edition', false);
    controller.set('areas', this.modelFor('application'));
    controller.set('competence', this.modelFor('competence'));
    const competenceController = this.controllerFor('competence');
    competenceController.set('section', 'challenges');
    if (!model.get('isValidated')) {
      competenceController.set('view', 'workbench');
      if (model.get('isWorkbench')) {
        competenceController.set('view', 'workbench-list');
      }
    } else {
      competenceController.set('view', 'production');
    }
  }

  @action
  willTransition(transition) {
    if (this.controller.get('edition')) {
      if (confirm('Êtes-vous sûr de vouloir abandonner la modification en cours ?')) {
        this.controller.send('cancelEdit');
        return true;
      } else {
        transition.abort();
      }
    } else {
      if (transition.targetName === 'competence.skills.index' || transition.targetName === 'competence.quality.index') {
        const challenge = this.controller.get('challenge');
        if (!challenge.get('isWorkbench')) {
          const skills = challenge.get('skills');
          const skill = skills.get('firstObject');
          if (skill) {
            if (transition.targetName === 'competence.quality.index' && skill.get('productionTemplate')) {
              return this.transitionTo('competence.quality.single', this.controller.get('competence'), skill);
            } else if (transition.targetName === 'competence.skills.index') {
              return this.transitionTo('competence.skills.single', this.controller.get('competence'), skill);
            }
          }
        }
      }
      this.controller.set("edition", false);
      return true;
    }
  }
}
