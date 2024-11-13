import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CompetenceOverviewRoute extends Route {

  @service store;

  queryParams = {
    locale: {
      refreshModel: true,
    },
  };

  async model(params) {
    const { competence_id, overview, locale } = params;

    let id = `${competence_id}:${overview}`;
    if (locale) id += `:${locale}`;

    const competenceOverview = await this.store.findRecord('competence-overview', id);

    return {
      competenceOverview,
      locale,
    };
  }
}
