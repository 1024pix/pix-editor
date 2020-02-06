import classic from 'ember-classic-decorator';
import Tube from './single';

@classic
export default class NewRoute extends Tube {
  templateName = "competence/tubes/single";

  model() {
    return this.get("store").createRecord("tube");
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.set('competence', this.modelFor('competence'));
    controller.send("edit");
  }
}
