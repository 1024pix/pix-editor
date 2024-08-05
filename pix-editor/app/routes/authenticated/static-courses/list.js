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
    name: {
      refreshModel: true,
    },
    tagIds: {
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
          name: params.name,
          tagIds: params.tagIds
        },
      },
      { reload: true }
    );
    const staticCourseTags = await this.store.findAll('static-course-tag');
    return {
      staticCourseSummaries,
      staticCourseTags,
      mayCreateStaticCourse: this.access.mayCreateOrEditStaticCourse(),
    };
  }
}
