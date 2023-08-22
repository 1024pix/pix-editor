import Model, { attr } from '@ember-data/model';

export default class StaticCourseSummaryModel extends Model {
  @attr name;
  @attr challengeCount;
  @attr isActive;
  @attr createdAt;

  get previewURL() {
    return `https://app.pix.fr/courses/${this.id}`;
  }
}
