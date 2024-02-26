import Model, { attr, hasMany } from '@ember-data/model';

export default class StaticCourseSummaryModel extends Model {
  @attr name;
  @attr challengeCount;
  @attr isActive;
  @attr createdAt;
  @hasMany('static-course-tag') tags;

  get previewURL() {
    return `https://app.pix.fr/courses/${this.id}`;
  }
}
