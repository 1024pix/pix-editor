import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class LocalizedPrototypeRoute extends Route {
  @service store;

  model({ localized_challenge_id }) {
    return this.store.findRecord('localized_challenge', localized_challenge_id);
  }
}
