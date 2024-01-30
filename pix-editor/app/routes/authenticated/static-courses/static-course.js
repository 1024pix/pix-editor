import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class StaticCourseRoute extends Route {
  @service store;

  model(params) {
    return this.store.findRecord('static-course', params.static_course_id);
  }
}
