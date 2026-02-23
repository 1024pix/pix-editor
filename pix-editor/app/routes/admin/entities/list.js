import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class AdminEntityListRoute extends Route {
  @service config;
  @service session;
  @service access;
  @service store;
  @service router;

  queryParams = { pageNumber: { refreshModel: true }, pageSize: { refreshModel: true } };

  beforeModel() {
    const { schemas } = this.modelFor('admin');
    if (schemas.length === 0) this.router.transitionTo('admin');

    const { entity_name } = this.paramsFor('admin.entities');
    if (!schemas.find(({ entityName }) => entityName === entity_name)) this.router.transitionTo('admin');
  }

  async model(params) {
    const { schemas } = this.modelFor('admin');
    const { entity_name } = this.paramsFor('admin.entities');
    const schema = schemas.find(({ entityName }) => {
      return entityName === entity_name;
    });

    const entityList = await this.store.query(
      'admin-entity',
      {
        entityName: entity_name,
        page: {
          number: params.pageNumber,
          size: params.pageSize,
        },
      },
      { reload: true },
    );

    return { schema, entityList };
  }
}
