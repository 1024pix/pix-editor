import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdminRoute extends Route {
  @service config;
  @service session;
  @service access;
  @service store;
  @service router;

  beforeModel(transition) {
    const { schemas } = this.modelFor('admin');
    if (schemas.length === 0) this.router.transitionTo('admin');
    const { entity_id } = transition.to.params;
    if (!schemas.find(({ id }) => id === entity_id)) this.router.transitionTo('admin');
  }

  async model(params) {
    const { schemas } = this.modelFor('admin');
    const { entity_id } = params;

    const schema = schemas.find(({ id }) => id === entity_id);
    const entityList = await this.store.query('admin-entity', { filter: { id: entity_id } });

    return { schema, entityList };
  }
}
