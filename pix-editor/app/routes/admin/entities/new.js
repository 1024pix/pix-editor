import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdminNewEntityRoute extends Route {
  @service config;
  @service session;
  @service access;
  @service store;
  @service router;

  beforeModel() {
    const { schemas } = this.modelFor('admin');
    if (schemas.length === 0) this.router.transitionTo('admin');

    const { entity_name } = this.paramsFor('admin.entities');
    if (!schemas.find(({ entityName }) => entityName === entity_name)) this.router.transitionTo('admin');
  }

  async model() {
    const { schemas } = this.modelFor('admin');
    const { entity_name } = this.paramsFor('admin.entities');
    const schema = schemas.find(({ entityName }) => {
      return entityName === entity_name;
    });

    return { schema };
  }
}
