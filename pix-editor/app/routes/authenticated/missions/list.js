import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class MissionsRoute extends Route {
  queryParams = {
    pageNumber: {
      refreshModel: true,
    },
    pageSize: {
      refreshModel: true,
    },
    statuses: {
      refreshModel: true,
    },
  };

  @service store;
  @service access;
  async model(params) {
    const missions = await this.store.query('mission-summary', {
      page: {
        number: params.pageNumber,
        size: params.pageSize,
      },

      filter: {
        statuses: params.statuses,
      },
    }, { reload: true });
    return {
      missions,
      mayCreateOrEditMissions: this.access.isEditor()
    };
  }
}
