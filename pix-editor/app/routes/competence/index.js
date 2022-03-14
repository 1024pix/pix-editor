import { inject as service } from '@ember/service';
import AuthenticatedRoute from '../authenticated';

export default class CompetenceIndexRoute extends AuthenticatedRoute {
  @service currentData;

  afterModel() {
    super.afterModel(...arguments);
    this.currentData.setPrototype(null);
  }

}
