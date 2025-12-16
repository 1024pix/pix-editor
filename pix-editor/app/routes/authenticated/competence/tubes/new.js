import { service } from '@ember/service';

import Tube from './single';

export default class NewRoute extends Tube {
  queryParams = { themeId: { refreshModel: true } };

  templateName = 'authenticated/competence/tubes/single';
  @service store;

  async model(params) {
    const theme = await this.store.findRecord('theme', params.themeId);
    return this.store.createRecord('tube', { theme });
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.send('edit');
  }
}
