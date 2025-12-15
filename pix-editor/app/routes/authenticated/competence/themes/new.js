import { service } from '@ember/service';

import CompetenceThemesSingleRoute from './single';

export default class CompetenceThemesNewRoute extends CompetenceThemesSingleRoute {
  templateName = 'authenticated/competence/themes/single';
  @service store;

  model() {
    return this.store.createRecord('theme');
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.send('edit');
  }
}
