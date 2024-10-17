import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class CompetenceRoute extends Route {
  @service currentData;
  @service store;
  @service router;

  queryParams = {
    view: {
      refreshModel: true,
    },
    languageFilter: {
      refreshModel: true,
    },
  };

  model(params) {
    return this.store.findRecord('competence', params.competence_id);
  }

  async afterModel(model) {
    this.currentData.setCompetence(model);
    const area = await model.area;
    const framework = await area.framework;
    this.currentData.setFramework(framework);
  }
}
