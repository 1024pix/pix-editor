import CompetenceThemesSingleRoute from './single';
import { inject as service } from '@ember/service';

export default class CompetenceThemesNewRoute extends CompetenceThemesSingleRoute {
  templateName = 'authenticated/competence/themes/single';
  @service store;
  @service idGenerator;

  model() {
    return this.store.createRecord('theme', {
      pixId: this.idGenerator.newId('thematic'),
    });
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.send('edit');
  }
}
