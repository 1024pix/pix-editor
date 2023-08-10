import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class StaticCoursesRoute extends Route {
  queryParams = {
    pageNumber: {
      refreshModel: true,
    },
    pageSize: {
      refreshModel: true,
    },
    isActive: {
      refreshModel: true,
    },
  };

  @service store;
  @service access;

  async model(params) {
    const staticCourseSummaries = await this.store.query(
      'static-course-summary',
      {
        page: {
          number: params.pageNumber,
          size: params.pageSize,
        },
        filter: {
          isActive: params.isActive,
        },
      },
      { reload: true }
    );
    return {
      staticCourseSummaries,
      mayCreateStaticCourse: this.access.mayCreateOrEditStaticCourse(),
    };
  }
}
