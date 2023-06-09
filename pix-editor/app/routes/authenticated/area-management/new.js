import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class AreaManagementNewRoute extends Route {

  @service currentData;
  @service idGenerator;
  @service store;

  async model(params) {
    const framework = this.store.peekRecord('framework', params.framework_id);
    const areas = await framework.get('areas');
    const area = this.store.createRecord('area', {
      code: `${areas.length + 1}`,
      pixId: this.idGenerator.newId('area'),
    });
    return { area, framework };
  }

  async afterModel(model) {
    if (model) {
      this.currentData.setFramework(model.framework);
    }
  }
}
