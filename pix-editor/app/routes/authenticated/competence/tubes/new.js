import Tube from './single';
import { inject as service } from '@ember/service';

export default class NewRoute extends Tube {

  queryParams = {
    themeId: {
      refreshModel: true
    }
  };

  templateName = 'authenticated/competence/tubes/single';
  @service idGenerator;
  @service store;

  async model(params) {
    const theme = await this.store.findRecord('theme', params.themeId);
    return this.store.createRecord('tube', {
      pixId: this.idGenerator.newId('tube'),
      theme
    });
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.send('edit');
  }
}
