import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class StaticCoursesController extends Controller {
  @service router;
  queryParams = ['pageNumber', 'pageSize', 'isActive', 'name'];
  @tracked pageNumber = 1;
  @tracked pageSize = 10;
  @tracked showActiveOnly = true;
  @tracked isActive = true;
  @tracked tempIsActive = true;
  @tracked name = '';
  @tracked tempName = '';

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
    this.tempIsActive = this.showActiveOnly || null;
  }

  @action
  async updateName(event) {
    this.tempName = event.target.value;
  }

  @action
  clearFilters() {
    this.showActiveOnly = true;
    this.isActive = true;
    this.name = '';
  }

  @action
  async submitFilters(event) {
    event.preventDefault();
    this.name = this.tempName;
    this.isActive = this.tempIsActive;
  }
}
