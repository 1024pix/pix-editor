import { action } from '@ember/object';
import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CompetenceRoute extends Route {
  @service currentData;
  @service paginatedQuery;
  @service store;

  @tracked competenceModel;

  queryParams = {
    locale: {
      refreshModel: true,
    },
  };

  async model(params) {
    this.competenceModel = await this.store.findRecord('competence', params.competence_id);
    return this.store.findRecord('competence-overview', this.competenceModel.pixId, { adapterOptions: { locale: params.locale } });
  }

  async afterModel() {
    this.currentData.setCompetence(this.competenceModel);
    const area = await this.competenceModel.area;
    const framework = await area.framework;
    this.currentData.setFramework(framework);
  }

  @action
  refreshModel() {
    const model = this.modelFor(this.routeName);
    model.needsRefresh = true;
    this.refresh();
  }
}
