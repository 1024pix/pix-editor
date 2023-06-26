import Model, { attr } from '@ember-data/model';

export default class StaticCourseSummaryModel extends Model {
  @attr name;
  @attr createdAt;
  @attr challengeCount;

  get previewURL() {
    return `https://app.recette.pix.fr/courses/${this.id}`;
  }
}
