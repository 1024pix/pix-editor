import Model, { attr, hasMany } from '@ember-data/model';

export default class StaticCourseModel extends Model {
  @attr name;
  @attr description;
  @attr isActive;
  @attr deactivationReason;
  @attr createdAt;
  @attr updatedAt;

  @hasMany('challenge-summary') challengeSummaries;
  @hasMany('static-course-tag') tags;

  get previewURL() {
    return `https://app.pix.fr/courses/${this.id}`;
  }

  get sortedChallengeSummaries() {
    return this.challengeSummaries.sortBy('index');
  }
}
