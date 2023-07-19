import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class StaticCoursesController extends Controller {
  @service router;

  @action
  async copyStaticCoursePreviewUrl(staticCourseSummary) {
    await navigator.clipboard.writeText(staticCourseSummary.previewURL);
  }

  @action
  async goToStaticCourseDetails(staticCourseId, event) {
    event.preventDefault();
    this.router.transitionTo('authenticated.static-courses.static-course.details', staticCourseId);
  }
}
