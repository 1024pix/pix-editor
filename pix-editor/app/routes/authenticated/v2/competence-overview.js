import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CompetenceOverviewRoute extends Route {

  @service router;
  @service store;
  @service versionManager;

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

  afterModel(model) {
    if (this.versionManager.isV2) return;

    const { competenceOverview } = model;
    const competence_id = competenceOverview.airtableId;
    const locale = competenceOverview.locale;
    const view = competenceOverview.view;

    this.router.transitionTo('authenticated.competence.prototypes', competence_id, { queryParams: { languageFilter: locale, view } });
  }
}
