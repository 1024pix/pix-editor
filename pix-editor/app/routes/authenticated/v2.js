import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class V2Route extends Route {
  @service store;
  @service router;
  @service versionManager;

  queryParams = {
    locale: {
      refreshModel: true,
    },
  };

  async model(params) {
    const competence = await this.store.findRecord('competence', params.competence_id);
    return {
      competence,
      locale: params.locale,
    };
  }

  afterModel(model, transition) {
    const { competence, locale } = model;
    const competence_id = competence.id;
    if (this.versionManager.isV2) {
      if (transition.to.name === 'authenticated.v2.index') {
        this.router.transitionTo('authenticated.v2.competence-overview', competence_id, 'challenges-production');
      }
      return;
    }
    const view = extractViewFromTransition(transition);
    this.router.transitionTo('authenticated.competence.prototypes', competence_id, { queryParams: { languageFilter: locale, view } });
  }
}

// L'information sur la vue est au niveau de la route enfant
// On peut trouver cette info dans la transition
// On parcourt tous les RouteInfo dans la transition jusqu'à trouver celui de la route qui contient la vue
function extractViewFromTransition(transition) {
  if (!transition?.from) {
    return 'production';
  }
  const routeInfoOfCompetenceOverview = transition.from.find((item) => item.params.overview);
  const [, view] = routeInfoOfCompetenceOverview.params.overview.split('-');
  return view;
}
