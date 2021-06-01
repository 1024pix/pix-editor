import Route from '@ember/routing/route';

export default class AreaManagementNewRoute extends Route {

  async model(params) {
    const framework = this.store.peekRecord('framework', params.framework_id);
    const areas = await framework.get('areas');
    const area = this.store.createRecord('area', {
      code: `${areas.length + 1}`,
    });
    return { area, framework };
  }
}
