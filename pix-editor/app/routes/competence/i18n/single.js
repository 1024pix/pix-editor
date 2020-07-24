import Route from '@ember/routing/route';

export default class CompetenceI18nSingleRoute extends Route {

  model(params) {
    return this.store.findRecord('skill', params.skill_id);
  }

  setupController() {
    super.setupController(...arguments);
    const competenceController = this.controllerFor('competence');
    competenceController.setSection('i18n');
    competenceController.setSkillView(null);
    competenceController.setView(null);
  }

}
