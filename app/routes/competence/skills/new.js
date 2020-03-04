import SingleRoute from './single';
import { inject as service } from '@ember/service';

export default class NewRoute extends SingleRoute {
  templateName = 'competence/skills/single';
  @service idGenerator;

  model() {
    return {
      skill:this.store.createRecord('skill', {status:'en construction', pixId:this.idGenerator.newId()})
    };
  }

  afterModel(model) {
    let params = this.paramsFor(this.routeName);
    return this.store.findRecord('tube', params.tube_id)
    .then((tube) => {
      let level = parseInt(params.level)+1;
      model.skill.name = tube.name+level;
      model.skill.level = level;
      model.tube = tube;
    });
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.send('edit');
  }
}
