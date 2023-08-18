import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class StaticCoursesController extends Controller {
  @service router;
  queryParams = ['pageNumber', 'pageSize', 'isActive'];
  @tracked pageNumber = 1;
  @tracked pageSize = 10;
  @tracked showActiveOnly = true;
  @tracked isActive = true;

  @action
  async copyStaticCoursePreviewUrl(staticCourseSummary) {
    await navigator.clipboard.writeText(staticCourseSummary.previewURL);
  }

  @action
  async goToStaticCourseDetails(staticCourseId, event) {
    event.preventDefault();
    this.router.transitionTo('authenticated.static-courses.static-course.details', staticCourseId);
  }

  @action
  async toggleShowActiveOnly() {
    this.showActiveOnly = !this.showActiveOnly;
    this.isActive = this.showActiveOnly || null;
  }

  @action
  clearFilters() {
    this.showActiveOnly = true;
    this.isActive = true;
  }
}
