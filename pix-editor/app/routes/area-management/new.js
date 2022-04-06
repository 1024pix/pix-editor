import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import AuthenticatedRoute from '../authenticated';

export default class AreaManagementNewRoute extends AuthenticatedRoute {

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

  @action
  async willTransition(transition) {
    const controller = this.controllerFor('area-management.new');
    const modelHasDirtyAttributes = controller.area.get('hasDirtyAttributes');
    if (modelHasDirtyAttributes && !confirm('Êtes-vous sûr de vouloir abandonner la création en cours ?')) {
      transition.abort();
    } else if (modelHasDirtyAttributes) {
      controller.store.deleteRecord(controller.area);
      return true;
    } else {
      return true;
    }
  }
}
