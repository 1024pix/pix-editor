import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CompetenceOverviewRoute extends Route {

  @service router;
  @service store;
  @service versionManager;

  async model(params) {
    const overview = params.overview;
    const { competence, locale } = this.modelFor('authenticated.v2');

    let id = `${competence.pixId}:${overview}`;
    if (locale) id += `:${locale}`;
    const competenceOverview = await this.store.findRecord('competence-overview', id);

    return {
      competenceOverview,
      locale,
    };
  }
}
