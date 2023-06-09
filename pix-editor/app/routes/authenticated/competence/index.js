import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class CompetenceIndexRoute extends Route {
  @service currentData;

  afterModel() {
    super.afterModel(...arguments);
    this.currentData.setPrototype(null);
  }

}
