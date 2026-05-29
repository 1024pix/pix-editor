import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class WorkbenchModulesRoute extends Route {
  queryParams = {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
  };

  @service store;

  async model(params) {
    const draftModules = await this.store.query(
      'draft-module',
      {
        page: {
          number: params.pageNumber,
          size: params.pageSize,
        },
      },
      { reload: true },
    );
    return { draftModules };
  }
}
