import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MissionRoute extends Route {
  @service router;
  @service store;
  @service currentData;

  model(params) {
    return this.store.findRecord('mission', params.mission_id);
  }
}
