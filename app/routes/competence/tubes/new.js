import Tube from './single';
import { inject as service } from '@ember/service';

export default class NewRoute extends Tube {

  templateName = 'competence/tubes/single';
  @service idGenerator;

  model() {
    return this.store.createRecord('tube', {pixId:this.idGenerator.newId()});
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.competence = this.modelFor('competence');
    controller.send('edit');
  }
}
