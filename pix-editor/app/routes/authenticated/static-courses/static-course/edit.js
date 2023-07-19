import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class StaticCoursesRoute extends Route {
  @service store;
  @service access;

  beforeModel() {
    if (!this.access.mayCreateOrEditStaticCourse()) {
      this.router.transitionTo('authenticated.static-courses.list');
    }
  }

  model() {
    return this.modelFor('authenticated.static-courses.static-course');
  }
}
