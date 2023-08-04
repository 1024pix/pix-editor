import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class StaticCoursesRoute extends Route {
  @service store;
  @service access;

  model() {
    const staticCourse = this.modelFor('authenticated.static-courses.static-course');
    return {
      staticCourse,
      mayEditStaticCourse: this.access.mayCreateOrEditStaticCourse() && staticCourse.isActive,
    };
  }
}
