import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ProductionModulesRoute extends Route {
  queryParams = {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
    internalTitle: { refreshModel: true },
  };

  @service store;

  async model(params) {
    const modules = await this.store.query(
      'module',
      {
        page: {
          number: params.pageNumber,
          size: params.pageSize,
        },
        filter: {
          internalTitle: params.internalTitle,
        },
      },
      { reload: true },
    );
    return { modules };
  }
}
