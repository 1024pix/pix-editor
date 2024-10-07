import Model, { attr, hasMany } from '@ember-data/model';
import _ from 'lodash';

export default class StaticCourseModel extends Model {
  @attr name;
  @attr description;
  @attr isActive;
  @attr deactivationReason;
  @attr createdAt;
  @attr updatedAt;

  @hasMany('challenge-summary', { async: true, inverse: null }) challengeSummaries;
  @hasMany('static-course-tag', { async: true, inverse: null }) tags;

  get previewURL() {
    return `https://app.pix.fr/courses/${this.id}`;
  }

  get sortedChallengeSummaries() {
    const summaries = this.hasMany('challengeSummaries').value() || [];
    return _.sortBy(summaries, 'index');
  }
}
