import classic from 'ember-classic-decorator';
import SingleRoute from './single';
import { inject as service } from '@ember/service';

@classic
export default class NewRoute extends SingleRoute {
  templateName = 'competence/skills/single';
  @service
  idGenerator;

  model() {
    return {
      skill:this.get('store').createRecord('skill',{status:'en construction', pixId:this.get('idGenerator').newId()})
    };
  }

  afterModel(model) {
    let params = this.paramsFor(this.routeName);
    return this.get('store').findRecord('tube', params.tube_id)
    .then((tube) => {
      let level = parseInt(params.level)+1;
      model.skill.set('name', tube.get('name')+level);
      model.skill.set('level', level);
      model.tube = tube;
    });
  }

  setupController(controller) {
    super.setupController(...arguments);
    controller.send('edit');
  }
}
