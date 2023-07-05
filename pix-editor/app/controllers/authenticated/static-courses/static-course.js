import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';


export default class StaticCoursesController extends Controller {
  @service router;

  @action
  async copyStaticCoursePreviewUrl(staticCourse) {
    await navigator.clipboard.writeText(staticCourse.previewURL);
  }
}
