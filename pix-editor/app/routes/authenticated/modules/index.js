import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ModulesRoute extends Route {
  queryParams = {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
  };

  @service store;

  async model(params) {
    const modules = await this.store.query(
      'module-summary',
      {
        page: {
          number: params.pageNumber,
          size: params.pageSize,
        },
      },
      { reload: true },
    );
    return { modules };
  }
}
