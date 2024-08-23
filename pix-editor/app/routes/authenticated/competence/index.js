import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CompetenceIndexRoute extends Route {
  @service currentData;

  afterModel() {
    super.afterModel(...arguments);
    this.currentData.setPrototype(null);
  }

}
