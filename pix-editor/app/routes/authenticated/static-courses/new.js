import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class StaticCourseNewRoute extends Route {
  @service access;
  @service router;

  beforeModel() {
    if (!this.access.mayCreateOrEditStaticCourse()) {
      this.router.transitionTo('authenticated.static-courses.list');
    }
  }
}
