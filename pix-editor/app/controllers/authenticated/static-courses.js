import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class StaticCoursesController extends Controller {
  @action
  async copyStaticCoursePreviewUrl(staticCourseSummary) {
    await navigator.clipboard.writeText(staticCourseSummary.previewURL);
  }
}
