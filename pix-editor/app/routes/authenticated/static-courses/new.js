import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class StaticCourseNewRoute extends Route {
  @service access;
  @service router;
  @service store;

  beforeModel() {
    if (!this.access.mayCreateOrEditStaticCourse()) {
      this.router.transitionTo('authenticated.static-courses.list');
    }
  }

  async model() {
    const staticCourseTags = await this.store.findAll('static-course-tag', { reload: true });
    return { staticCourseTags };
  }
}
