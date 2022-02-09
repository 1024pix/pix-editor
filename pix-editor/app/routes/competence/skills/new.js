import SingleRoute from './single';
import { inject as service } from '@ember/service';

export default class NewRoute extends SingleRoute {
  templateName = 'competence/skills/single';
  @service idGenerator;
  @service store;

  model() {
    return {
      skill: this.store.createRecord('skill', { status: 'en construction', pixId: this.idGenerator.newId('skill') })
    };
  }

  async afterModel(model) {
    const params = this.paramsFor(this.routeName);
    const tube = await this.store.findRecord('tube', params.tube_id);
    const level = parseInt(params.level) + 1;
    model.skill.name = tube.name + level;
    model.skill.level = level;
    model.tube = tube;
    return tube;
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.send('edit');
  }
}
