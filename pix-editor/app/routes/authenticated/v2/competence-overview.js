import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class PrototypesRoute extends Route {

  @service store;

  async model(params) {
    const { competence_id, overview, locale } = params;

    let id = `${competence_id}:${overview}`;
    if (locale) id += `:${locale}`;
    return this.store.findRecord('competence-overview', id);
  }
}
