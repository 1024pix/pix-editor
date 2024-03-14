import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class SynchronizeTranslationsRoute extends Route {
  @service store;

  model() {
    return this.store.createRecord('phrase');
  }
}
