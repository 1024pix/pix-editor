import AuthenticatedRoute from '../../authenticated';

export default class CompetenceI18nSingleRoute extends AuthenticatedRoute {

  model(params) {
    return this.store.findRecord('skill', params.skill_id);
  }

  setupController() {
    super.setupController(...arguments);
    const competenceController = this.controllerFor('competence');
    competenceController.setSection('i18n');
    competenceController.setView(null);
  }

}
