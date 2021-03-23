import Tube from './single';
import { inject as service } from '@ember/service';

export default class NewRoute extends Tube {

  queryParams = {
    themeId: {
      refreshModel: true
    }
  };

  templateName = 'competence/tubes/single';
  @service idGenerator;

  model(params) {
    return this.store.findRecord('theme', params.themeId)
      .then(theme => {
        return this.store.createRecord('tube', {
          pixId:this.idGenerator.newId(),
          theme
        });
      });
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.send('edit');
  }
}
