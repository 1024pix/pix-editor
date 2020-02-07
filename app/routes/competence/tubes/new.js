import classic from 'ember-classic-decorator';
import Tube from './single';
import { inject as service } from '@ember/service';

@classic
export default class NewRoute extends Tube {
  templateName = "competence/tubes/single";

  @service
  idGenerator;

  model() {
    return this.get("store").createRecord("tube", {pixId:this.get('idGenerator').newId()});
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.set('competence', this.modelFor('competence'));
    controller.send("edit");
  }
}
