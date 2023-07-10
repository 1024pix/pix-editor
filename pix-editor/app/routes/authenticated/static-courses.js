import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class StaticCoursesRoute extends Route {
  @service access;
  @service router;

  beforeModel() {
    if (!this.access.mayAccessStaticCourses()) {
      this.router.transitionTo('authenticated');
    }
  }
}
