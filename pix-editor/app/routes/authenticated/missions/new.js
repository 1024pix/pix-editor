import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MissionNewRoute extends Route {
  @service access;
  @service router;
  @service store;

  beforeModel() {
    if (!this.access.mayCreateOrEditStaticCourse()) {
      this.router.transitionTo('authenticated.missions.list');
    }
  }

  model() {
    return this.store.createRecord('mission');
  }
}