import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class StaticCoursesController extends Controller {
  @service router;
  queryParams = ['pageNumber', 'pageSize', 'isActive', 'name', 'tagIds'];
  @tracked pageNumber = 1;
  @tracked pageSize = 10;
  @tracked showActiveOnly = true;
  @tracked isActive = true;
  @tracked tempIsActive = true;
  @tracked tagIds = [];
  @tracked tempTagIds = [];
  @tracked name = '';
  @tracked tempName = '';

  get tagOptions() {
    return this.model.staticCourseTags
      .map(({ id, label }) => ({ value: id, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

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
  async selectTags(tags) {
    this.tempTagIds = tags;
  }

  @action
  clearFilters() {
    this.showActiveOnly = true;
    this.isActive = true;
    this.name = '';
    this.tagIds = [];
    this.tempTagIds = [];
  }

  @action
  async submitFilters(event) {
    event.preventDefault();
    this.name = this.tempName;
    this.isActive = this.tempIsActive;
    this.tagIds = this.tempTagIds;
  }
}
