import CompetenceThemesSingleRoute from './single';

export default class CompetenceThemesNewRoute extends CompetenceThemesSingleRoute {
  templateName = 'competence/themes/single';

  model() {
    return this.store.createRecord('theme');
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.send('edit');
  }
}
