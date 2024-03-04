import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class StaticCoursesRoute extends Route {
  @service store;
  @service access;
  @service router;

  beforeModel() {
    if (!this.access.mayCreateOrEditStaticCourse()) {
      this.router.transitionTo('authenticated.static-courses.list');
    }
  }

  async model() {
    const staticCourseTags = await this.store.findAll('static-course-tag', { reload: true });
    const staticCourse = this.modelFor('authenticated.static-courses.static-course');
    return { staticCourseTags, staticCourse };
  }

  afterModel(model) {
    if (!model.staticCourse.isActive) {
      this.router.transitionTo('authenticated.static-courses.static-course.details', model.staticCourse);
    }
  }
}
