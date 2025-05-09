import { inject as service } from '@ember/service';

import SingleRoute from './single';

export default class NewRoute extends SingleRoute {
  templateName = 'authenticated/competence/skills/single';
  @service store;

  async model(params) {
    const tube = await this.store.findRecord('tube', params.tube_id);
    const level = parseInt(params.level);
    return this.store.createRecord('skill', {
      name: `${tube.name}${level}`,
      level,
      status: 'en construction',
      tube,
    });
  }

  async afterModel() {
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.send('edit');
  }
}
