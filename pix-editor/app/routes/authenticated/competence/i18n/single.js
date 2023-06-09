import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CompetenceI18nSingleRoute extends Route {

  @service store;

  model(params) {
    return this.store.findRecord('skill', params.skill_id);
  }

  setupController() {
    super.setupController(...arguments);
    const competenceController = this.controllerFor('authenticated.competence');
    competenceController.setSection('i18n');
    competenceController.setView(null);
  }

}
